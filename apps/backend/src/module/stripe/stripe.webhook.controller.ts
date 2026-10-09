import {
  Controller,
  Post,
  Headers,
  Req,
  HttpCode,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { StripeService } from './stripe.service.js';
import { PrismaService } from '@wabisabiart/db';

@Controller('stripe')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Headers('stripe-signature') sig: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!sig) throw new BadRequestException('Missing stripe-signature header');
    if (!req.rawBody) throw new BadRequestException('Missing request body');

    const event = await Promise.resolve(
      this.stripeService.constructWebhookEvent(req.rawBody, sig),
    );
    this.logger.log(`Stripe event: ${event.type} [${event.id}]`);

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.onCheckoutSessionCompleted(event.data.object);
          break;
        case 'payment_intent.succeeded':
          await this.onPaymentSucceeded(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.onPaymentFailed(event.data.object);
          break;
        case 'payment_intent.canceled':
          await this.onPaymentCanceled(event.data.object);
          break;
        case 'charge.refunded':
          await this.onChargeRefunded(event.data.object);
          break;
        case 'charge.dispute.created':
          await this.onDisputeCreated(event.data.object);
          break;
        case 'account.updated':
          await this.onAccountUpdated(event.data.object);
          break;
        case 'account.application.deauthorized':
          await this.onAccountDeauthorized(event.data.object as any);
          break;
        default:
          this.logger.log(`Unhandled event: ${event.type}`);
      }
    } catch (err) {
      this.logger.error(`Error processing ${event.type} [${event.id}]`, err);
    }

    return { received: true };
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  /**
   * Fired when a Stripe Checkout Session payment completes.
   * This is the PRIMARY handler for checkout session payments.
   * orderId is reliably in session.metadata.
   */
  private async onCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const orderId = session.metadata?.orderId;
    if (!orderId) {
      this.logger.warn(
        `checkout.session.completed missing orderId: ${session.id}`,
      );
      return;
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { seller: true },
    });

    if (!order) {
      this.logger.warn(`Order not found: ${orderId}`);
      return;
    }

    // Idempotency guard
    if (order.status === 'paid') {
      this.logger.log(`Order ${orderId} already PAID — skipping`);
      return;
    }

    const paymentIntentId = session.payment_intent as string;
    const chargeId = await this.resolveChargeId(paymentIntentId);

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'paid',
          stripePaymentIntentId: paymentIntentId,
          stripeChargeId: chargeId ?? null,
          paidAt: new Date(),
        },
      });

      await tx.paymentTransaction.updateMany({
        where: { orderId },
        data: {
          status: 'succeeded',
          providerTransactionId: paymentIntentId,
          processedAt: new Date(),
          metadata: {
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: paymentIntentId,
          },
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: 'paid',
          note: `Payment confirmed via Stripe Checkout: ${session.id}`,
        },
      });
    });

    this.logger.log(
      `Order ${orderId} marked PAID via checkout session — awaiting admin payout approval`,
    );
  }

  /**
   * Fired for PaymentIntent-based payments (direct intent flow, not checkout session).
   * For checkout session payments this also fires but orderId may be missing —
   * the idempotency guard prevents double-processing.
   */
  private async onPaymentSucceeded(intent: Stripe.PaymentIntent) {
    const orderId = intent.metadata?.orderId;
    if (!orderId) {
      // Checkout session flow may omit metadata on this event payload.
      // Recover by matching the already-saved payment intent ID.
      const matchedOrder = await this.prisma.order.findFirst({
        where: { stripePaymentIntentId: intent.id },
      });

      if (!matchedOrder) {
        this.logger.log(
          `payment_intent.succeeded has no orderId and no matching order: ${intent.id}`,
        );
        return;
      }

      const latestChargeId = (intent.latest_charge as string | null) ?? null;
      if (matchedOrder.status === 'paid' && matchedOrder.stripeChargeId) {
        this.logger.log(`Order ${matchedOrder.id} already PAID — skipping`);
        return;
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: matchedOrder.id },
          data: {
            status:
              matchedOrder.status === 'pending_payment'
                ? 'paid'
                : matchedOrder.status,
            stripeChargeId: latestChargeId ?? matchedOrder.stripeChargeId,
            paidAt:
              matchedOrder.paidAt ??
              (matchedOrder.status === 'pending_payment'
                ? new Date()
                : matchedOrder.paidAt),
          },
        });

        if (matchedOrder.status === 'pending_payment') {
          await tx.paymentTransaction.updateMany({
            where: { orderId: matchedOrder.id },
            data: {
              status: 'succeeded',
              providerTransactionId: intent.id,
              processedAt: new Date(),
            },
          });

          await tx.orderStatusHistory.create({
            data: {
              orderId: matchedOrder.id,
              status: 'paid',
              note: `Payment confirmed via Stripe: ${intent.id}`,
            },
          });
        }
      });

      this.logger.log(
        `Order ${matchedOrder.id} synced from payment_intent.succeeded`,
      );
      return;
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { seller: true },
    });

    if (!order) {
      this.logger.warn(`Order not found: ${orderId}`);
      return;
    }

    // Idempotency guard — may already be paid via checkout.session.completed
    if (order.status === 'paid') {
      this.logger.log(`Order ${orderId} already PAID — skipping`);
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'paid',
          stripePaymentIntentId: intent.id,
          stripeChargeId: intent.latest_charge as string,
          paidAt: new Date(),
        },
      });

      await tx.paymentTransaction.updateMany({
        where: { orderId },
        data: {
          status: 'succeeded',
          providerTransactionId: intent.id,
          processedAt: new Date(),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: 'paid',
          note: `Payment confirmed via Stripe: ${intent.id}`,
        },
      });
    });

    this.logger.log(
      `Order ${orderId} marked PAID — awaiting admin payout approval`,
    );
  }

  private async onPaymentFailed(intent: Stripe.PaymentIntent) {
    const orderId = intent.metadata?.orderId;
    if (!orderId) return;

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'payment_failed' },
    });

    await this.prisma.paymentTransaction.updateMany({
      where: { orderId },
      data: {
        status: 'failed',
        failureReason: intent.last_payment_error?.message,
      },
    });

    this.logger.warn(
      `Payment failed for order ${orderId}: ${intent.last_payment_error?.message}`,
    );
  }

  private async onPaymentCanceled(intent: Stripe.PaymentIntent) {
    const orderId = intent.metadata?.orderId;
    if (!orderId) return;

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'cancelled', cancelledAt: new Date() },
    });
  }

  private async onChargeRefunded(charge: Stripe.Charge) {
    if (!charge.payment_intent) return;

    const order = await this.prisma.order.findFirst({
      where: { stripePaymentIntentId: charge.payment_intent as string },
    });
    if (!order) return;

    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: 'refunded' },
    });

    this.logger.log(
      `Order ${order.id} ${charge.refunded ? 'fully' : 'partially'} refunded`,
    );
  }

  private async onDisputeCreated(dispute: Stripe.Dispute) {
    this.logger.warn(`Dispute created: ${dispute.id} — ${dispute.reason}`);
    if (!dispute.charge) return;

    const order = await this.prisma.order.findFirst({
      where: { stripeChargeId: dispute.charge as string },
    });
    if (!order) return;

    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: 'disputed' },
    });
  }

  private async onAccountUpdated(account: Stripe.Account) {
    const isReady = this.stripeService.isAccountReady(account);

    await this.prisma.sellerProfile.updateMany({
      where: { stripeAccountId: account.id },
      data: {
        stripeOnboardingDone: isReady,
        stripeChargesEnabled: account.charges_enabled ?? false,
        stripePayoutsEnabled: account.payouts_enabled ?? false,
      },
    });

    this.logger.log(`Seller account ${account.id} updated — ready: ${isReady}`);
  }

  private async onAccountDeauthorized(event: any) {
    const accountId = event.account as string;
    this.logger.warn(`Seller deauthorized Stripe account: ${accountId}`);

    await this.prisma.sellerProfile.updateMany({
      where: { stripeAccountId: accountId },
      data: {
        stripeOnboardingDone: false,
        stripeChargesEnabled: false,
        stripePayoutsEnabled: false,
      },
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Retrieves the charge ID from a PaymentIntent.
   * latest_charge may not be expanded in the webhook payload — fetch it if needed.
   */
  private async resolveChargeId(
    paymentIntentId: string | null | undefined,
  ): Promise<string | undefined> {
    if (!paymentIntentId) return undefined;
    try {
      const intent =
        await this.stripeService.retrievePaymentIntent(paymentIntentId);
      return intent.latest_charge as string | undefined;
    } catch {
      return undefined;
    }
  }
}
