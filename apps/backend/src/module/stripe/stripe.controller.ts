import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpCode,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import Stripe from 'stripe';
import { StripeService } from './stripe.service.js';
import { PrismaService } from '@wabisabiart/db';
import {
  CreatePaymentIntentDto,
  CreateCheckoutSessionDto,
  RefundOrderDto,
} from './stripe.dto.js';
import { Auth } from '../../decorators/auth.decorator.js';
import { CurrentUser } from '../../decorators/current-user.decorator.js';
import { UserRole } from '@wabisabiart/db';

@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
  ) {}

  // ── Seller Onboarding ──────────────────────────────────────────────────────

  @Post('seller/onboard')
  @Auth(UserRole.seller)
  async onboardSeller(
    @CurrentUser('id') userId: string,
    @Body() dto: { refreshUrl: string; completeUrl: string },
  ) {
    let seller = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (!seller) throw new NotFoundException('Seller profile not found');

    if (!seller.stripeAccountId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const account = await this.stripeService.createConnectedAccount(
        user!.email,
      );
      seller = await this.prisma.sellerProfile.update({
        where: { userId },
        data: { stripeAccountId: account.id },
      });
    }

    const link = await this.stripeService.createAccountLink(
      seller.stripeAccountId!,
      `${dto.refreshUrl}`,
      `${dto.completeUrl}`,
    );

    return link;
  }

  @Get('seller/dashboard-link')
  @Auth(UserRole.seller)
  async sellerDashboardLink(@CurrentUser('id') userId: string) {
    const seller = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (!seller?.stripeAccountId)
      throw new BadRequestException('Seller not onboarded to Stripe');

    const link = await this.stripeService.createLoginLink(
      seller.stripeAccountId,
    );
    return { url: link.url };
  }

  @Get('seller/onboarding-status')
  @Auth(UserRole.seller)
  async onboardingStatus(@CurrentUser('id') userId: string) {
    const seller = await this.prisma.sellerProfile.findUnique({
      where: { userId },
      select: {
        stripeAccountId: true,
        stripeOnboardingDone: true,
        stripeChargesEnabled: true,
        stripePayoutsEnabled: true,
      },
    });
    if (!seller) throw new NotFoundException('Seller profile not found');

    // If DB shows not done but account exists, sync live from Stripe
    if (seller.stripeAccountId && !seller.stripeOnboardingDone) {
      const account = await this.stripeService.retrieveConnectedAccount(
        seller.stripeAccountId,
      );
      const isReady = this.stripeService.isAccountReady(account);
      const updated = await this.prisma.sellerProfile.update({
        where: { userId },
        data: {
          stripeOnboardingDone: isReady,
          stripeChargesEnabled: account.charges_enabled ?? false,
          stripePayoutsEnabled: account.payouts_enabled ?? false,
        },
        select: {
          stripeAccountId: true,
          stripeOnboardingDone: true,
          stripeChargesEnabled: true,
          stripePayoutsEnabled: true,
        },
      });
      return updated;
    }

    return seller;
  }

  // ── Checkout ───────────────────────────────────────────────────────────────

  @Post('checkout/intent')
  @Auth(UserRole.customer)
  @HttpCode(201)
  async createIntent(
    @Body() dto: CreatePaymentIntentDto,
    @CurrentUser('id') userId: string,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, buyerId: userId },
      include: { seller: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'pending_payment') {
      throw new BadRequestException(
        `Order is not awaiting payment (status: ${order.status})`,
      );
    }

    const stripeCustomerId = await this.getOrCreateStripeCustomer(userId);
    const amountCents = this.stripeService.dollarsToCents(
      Number(order.totalAmount),
    );

    if (dto.paymentMethodId) {
      // ── Pay with saved card — no frontend card entry needed ──
      const intent = await this.stripeService.createPaymentIntentWithSavedCard({
        amountCents,
        currency: order.currency.toLowerCase(),
        orderId: order.id,
        customerId: stripeCustomerId!,
        paymentMethodId: dto.paymentMethodId,
        idempotencyKey: `pi-saved-${order.id}`,
      });

      await this.prisma.paymentTransaction.create({
        data: {
          orderId: order.id,
          amount: order.totalAmount,
          currency: order.currency,
          status: intent.status === 'succeeded' ? 'succeeded' : 'pending',
          provider: 'stripe',
          providerTransactionId: intent.id,
          metadata: { stripePaymentIntentId: intent.id },
        },
      });

      return { clientSecret: intent.client_secret, status: intent.status };
    }

    // ── New card — card auto-saved after payment via setup_future_usage ──
    const intent = await this.stripeService.createPaymentIntent({
      amountCents,
      currency: order.currency.toLowerCase(),
      orderId: order.id,
      customerId: stripeCustomerId,
      idempotencyKey: `pi-${order.id}`,
    });

    await this.prisma.paymentTransaction.create({
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        currency: order.currency,
        status: 'pending',
        provider: 'stripe',
        providerTransactionId: intent.id,
        metadata: { stripePaymentIntentId: intent.id },
      },
    });

    return { clientSecret: intent.client_secret };
  }

  @Post('checkout/session')
  @Auth(UserRole.customer)
  @HttpCode(201)
  async createCheckoutSession(
    @Body() dto: CreateCheckoutSessionDto,
    @CurrentUser('id') userId: string,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id: dto.orderId, buyerId: userId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (order.status !== 'pending_payment') {
      throw new BadRequestException(
        `Order is not awaiting payment (status: ${order.status})`,
      );
    }

    const stripeCustomerId = await this.getOrCreateStripeCustomer(userId);

    const itemsWithLogs = order.items.map((item) => {
      this.logger.log(
        `[Checkout] Item: "${item.productTitle}", DB image URL: ${item.imageUrl || 'null'}`,
      );
      return {
        name: item.productTitle,
        imageUrl: item.imageUrl,
        amountCents: this.stripeService.dollarsToCents(Number(item.unitPrice)),
        quantity: item.quantity,
      };
    });

    try {
      const session = await this.stripeService.createCheckoutSession({
        amountCents: this.stripeService.dollarsToCents(
          Number(order.totalAmount),
        ),
        currency: order.currency.toLowerCase(),
        orderId: order.id,
        orderNumber: order.orderNumber,
        items: itemsWithLogs,
        customerId: stripeCustomerId,
        successUrl: dto.successUrl,
        cancelUrl: dto.cancelUrl,
        idempotencyKey: `cs-${order.id}`,
      });

      this.logger.log(`[Checkout] Session created successfully: ${session.id}`);

      await this.prisma.paymentTransaction.create({
        data: {
          orderId: order.id,
          amount: order.totalAmount,
          currency: order.currency,
          status: 'pending',
          provider: 'stripe',
          providerTransactionId: session.payment_intent as string,
          metadata: { stripeCheckoutSessionId: session.id },
        },
      });

      return { url: session.url };
    } catch (error) {
      this.logger.error(
        `[Checkout] Failed to create session for order ${order.id}`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  // ── Refunds (Admin) ────────────────────────────────────────────────────────

  @Post('refund')
  @Auth(UserRole.admin)
  async refundOrder(@Body() dto: RefundOrderDto): Promise<Stripe.Refund> {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (!order.stripeChargeId)
      throw new BadRequestException('No Stripe charge found for this order');

    if (dto.amountCents) {
      return this.stripeService.refundPartial({
        stripeChargeId: order.stripeChargeId,
        amountCents: dto.amountCents,
        orderId: dto.orderId,
        reason: dto.reason,
      });
    }

    return this.stripeService.refundFull({
      stripeChargeId: order.stripeChargeId,
      orderId: dto.orderId,
      reason: dto.reason,
    });
  }

  // ── Payment Methods (Saved Cards) ──────────────────────────────────────────

  @Get('payment-methods')
  @Auth(UserRole.customer)
  async listPaymentMethods(
    @CurrentUser('id') userId: string,
  ): Promise<Stripe.ApiList<Stripe.PaymentMethod> | { data: never[] }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });
    if (!user?.stripeCustomerId) return { data: [] };
    return this.stripeService.listPaymentMethods(user.stripeCustomerId);
  }

  @Delete('payment-methods/:pmId')
  @Auth(UserRole.customer)
  async detachPaymentMethod(
    @Param('pmId') pmId: string,
  ): Promise<Stripe.PaymentMethod> {
    return this.stripeService.detachPaymentMethod(pmId);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private async getOrCreateStripeCustomer(
    userId: string,
  ): Promise<string | undefined> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true, email: true, fullName: true },
    });
    if (!user) return undefined;
    if (user.stripeCustomerId) return user.stripeCustomerId;

    const customer = await this.stripeService.createCustomer({
      email: user.email,
      name: user.fullName,
      userId,
    });
    await this.prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });
    return customer.id;
  }
}
