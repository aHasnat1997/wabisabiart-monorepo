import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@wabisabiart/db';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  // Cached fee — refreshed every 5 minutes
  private cachedFeePercent: number | null = null;
  private cacheExpiresAt = 0;
  private readonly CACHE_TTL_MS = 5 * 60 * 1000;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.config.get<string>('STRIPE_SECRET_KEY')!, {
      apiVersion: '2026-08-26.dahlia',
    });
  }

  /**
   * Resolves a stored media path to a Stripe-fetchable public HTTPS URL.
   * Order items persist media as relative paths, so Checkout needs the
   * configured bucket endpoint to build the public URL Stripe can fetch.
   */
  private toAbsoluteImageUrl(
    imageUrl: string | null | undefined,
  ): string | undefined {
    // Trim whitespace
    const trimmedUrl = imageUrl?.trim();
    if (!trimmedUrl) return undefined;

    // Already absolute HTTPS URL
    if (trimmedUrl.startsWith('https://')) {
      try {
        new URL(trimmedUrl);
        return trimmedUrl;
      } catch (error) {
        this.logger.warn(`Invalid HTTPS URL format: ${trimmedUrl}`);
        return undefined;
      }
    }

    if (trimmedUrl.startsWith('http://')) {
      this.logger.warn(`HTTP URL rejected (must be HTTPS): ${trimmedUrl}`);
      return undefined;
    }

    // Build from ENDPOINT + BUCKET_NAME
    const endpoint = this.config.get<string>('ENDPOINT');
    const bucketName = this.config.get<string>('BUCKET_NAME');

    if (!endpoint || !bucketName) {
      this.logger.warn(
        `Missing ENDPOINT or BUCKET_NAME. Cannot resolve relative path: ${trimmedUrl}`,
      );
      return undefined;
    }

    const normalizedEndpoint = endpoint.replace(/\/+$/, '');
    const normalizedImagePath = trimmedUrl.startsWith('/')
      ? trimmedUrl
      : `/${trimmedUrl}`;

    try {
      // Validate endpoint is valid HTTPS URL
      const endpointUrl = new URL(normalizedEndpoint);
      if (endpointUrl.protocol !== 'https:') {
        this.logger.warn(`ENDPOINT must be HTTPS: ${endpoint}`);
        return undefined;
      }

      // Construct final URL with proper encoding
      const fullUrl = `${normalizedEndpoint}/${bucketName}${normalizedImagePath}`;

      // URL-encode the entire path to handle spaces and special characters
      const encodedUrl = fullUrl
        .split('/')
        .map((segment, index) =>
          index === 0
            ? segment
            : encodeURIComponent(decodeURIComponent(segment)),
        )
        .join('/');

      // Validate final URL
      new URL(encodedUrl);

      this.logger.debug(`Resolved image URL: ${trimmedUrl} → ${encodedUrl}`);
      return encodedUrl;
    } catch (error) {
      this.logger.error(
        `Failed to construct image URL from ${trimmedUrl}`,
        error instanceof Error ? error.message : String(error),
      );
      return undefined;
    }
  }

  private resolveFrontendUrl(rawUrl: string): URL {
    const fallbackBase = 'http://localhost:3000';

    let parsed: URL;
    try {
      parsed = new URL(rawUrl, fallbackBase);
    } catch {
      throw new BadRequestException('Invalid URL');
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new BadRequestException('Invalid URL');
    }

    return parsed;
  }

  async getPlatformFeePercent(): Promise<number> {
    if (this.cachedFeePercent !== null && Date.now() < this.cacheExpiresAt) {
      return this.cachedFeePercent;
    }
    const setting = await this.prisma.platformFeeSetting.findUnique({
      where: { key: 'default' },
      select: { platformFeePercent: true },
    });
    this.cachedFeePercent = setting ? Number(setting.platformFeePercent) : 10;
    this.cacheExpiresAt = Date.now() + this.CACHE_TTL_MS;
    return this.cachedFeePercent;
  }

  async calculatePlatformFee(amountCents: number): Promise<number> {
    const feePercent = await this.getPlatformFeePercent();
    return Math.round(amountCents * (feePercent / 100));
  }

  // ── Seller Onboarding ──────────────────────────────────────────────────────

  async createConnectedAccount(email: string): Promise<Stripe.Account> {
    try {
      return await this.stripe.accounts.create({
        type: 'express',
        email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
    } catch (err) {
      this.logger.error('Failed to create connected account', err);
      throw new InternalServerErrorException('Could not create Stripe account');
    }
  }

  async createAccountLink(
    stripeAccountId: string,
    refreshUrl: string,
    returnUrl: string,
  ): Promise<Stripe.AccountLink> {
    return this.stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });
  }

  async createLoginLink(stripeAccountId: string): Promise<Stripe.LoginLink> {
    return this.stripe.accounts.createLoginLink(stripeAccountId);
  }

  async retrieveConnectedAccount(
    stripeAccountId: string,
  ): Promise<Stripe.Account> {
    return this.stripe.accounts.retrieve(stripeAccountId);
  }

  isAccountReady(account: Stripe.Account): boolean {
    return (
      account.details_submitted === true &&
      account.charges_enabled === true &&
      account.payouts_enabled === true
    );
  }

  // ── Payment Intents ────────────────────────────────────────────────────────

  async createPaymentIntent(params: {
    amountCents: number;
    currency?: string;
    orderId: string;
    customerId?: string;
    idempotencyKey?: string;
  }): Promise<Stripe.PaymentIntent> {
    const {
      amountCents,
      currency = 'usd',
      orderId,
      customerId,
      idempotencyKey,
    } = params;

    const createParams: Stripe.PaymentIntentCreateParams = {
      amount: amountCents,
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: { orderId },
      setup_future_usage: 'off_session',
    };

    if (customerId) createParams.customer = customerId;

    const options: Stripe.RequestOptions = {};
    if (idempotencyKey) options.idempotencyKey = idempotencyKey;

    try {
      return await this.stripe.paymentIntents.create(createParams, options);
    } catch (err) {
      this.logger.error(
        `Failed to create PaymentIntent for order ${orderId}`,
        err,
      );
      throw new InternalServerErrorException('Could not initiate payment');
    }
  }

  async retrievePaymentIntent(
    paymentIntentId: string,
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async createSetupIntent(customerId: string): Promise<Stripe.SetupIntent> {
    return this.stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session',
    });
  }

  async createPaymentIntentWithSavedCard(params: {
    amountCents: number;
    currency: string;
    orderId: string;
    customerId: string;
    paymentMethodId: string;
    idempotencyKey?: string;
  }): Promise<Stripe.PaymentIntent> {
    const options: Stripe.RequestOptions = {};
    if (params.idempotencyKey) options.idempotencyKey = params.idempotencyKey;

    return this.stripe.paymentIntents.create(
      {
        amount: params.amountCents,
        currency: params.currency,
        customer: params.customerId,
        payment_method: params.paymentMethodId,
        confirm: true,
        off_session: true,
        metadata: { orderId: params.orderId },
      },
      options,
    );
  }

  // ── Checkout Sessions ──────────────────────────────────────────────────────

  async createCheckoutSession(params: {
    amountCents: number;
    currency: string;
    orderId: string;
    orderNumber: string;
    items: {
      name: string;
      imageUrl?: string | null;
      amountCents: number;
      quantity: number;
    }[];
    customerId?: string;
    successUrl: string;
    cancelUrl: string;
    idempotencyKey?: string;
  }): Promise<Stripe.Checkout.Session> {
    const {
      currency,
      orderId,
      orderNumber,
      items,
      customerId,
      successUrl,
      cancelUrl,
      idempotencyKey,
    } = params;

    const success = this.resolveFrontendUrl(successUrl);
    success.searchParams.set('orderId', orderId);
    success.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');

    const cancel = this.resolveFrontendUrl(cancelUrl);
    cancel.searchParams.set('orderId', orderId);

    const options: Stripe.RequestOptions = {};
    if (idempotencyKey) options.idempotencyKey = idempotencyKey;

    try {
      return await this.stripe.checkout.sessions.create(
        {
          mode: 'payment',
          currency,
          line_items: items.map((item) => {
            const absoluteImage = this.toAbsoluteImageUrl(item.imageUrl);
            return {
              price_data: {
                currency,
                unit_amount: item.amountCents,
                product_data: {
                  name: item.name,
                  ...(absoluteImage ? { images: [absoluteImage] } : {}),
                },
              },
              quantity: item.quantity,
            };
          }),
          ...(customerId ? { customer: customerId } : {}),
          payment_intent_data: {
            metadata: { orderId, orderNumber },
            setup_future_usage: 'off_session',
          },
          metadata: { orderId, orderNumber },
          success_url: success.toString(),
          cancel_url: cancel.toString(),
        },
        options,
      );
    } catch (err) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      this.logger.error(
        `Failed to create Checkout Session for order ${orderId}`,
        err,
      );
      throw new InternalServerErrorException(
        'Could not create checkout session',
      );
    }
  }

  // ── Transfers ──────────────────────────────────────────────────────────────

  async transferToSeller(params: {
    amountCents: number;
    currency: string;
    sellerStripeAccountId: string;
    sourceChargeId: string;
    orderId: string;
    idempotencyKey?: string;
  }): Promise<Stripe.Transfer> {
    const {
      amountCents,
      currency,
      sellerStripeAccountId,
      sourceChargeId,
      orderId,
      idempotencyKey,
    } = params;

    const platformFee = await this.calculatePlatformFee(amountCents);
    const options: Stripe.RequestOptions = {};
    if (idempotencyKey) options.idempotencyKey = idempotencyKey;

    return this.stripe.transfers.create(
      {
        amount: amountCents - platformFee,
        currency,
        destination: sellerStripeAccountId,
        source_transaction: sourceChargeId,
        metadata: { orderId },
      },
      options,
    );
  }

  // ── Refunds ────────────────────────────────────────────────────────────────

  async refundFull(params: {
    stripeChargeId: string;
    reason?: Stripe.RefundCreateParams.Reason;
    orderId: string;
  }): Promise<Stripe.Refund> {
    const {
      stripeChargeId,
      reason = 'requested_by_customer',
      orderId,
    } = params;
    try {
      return await this.stripe.refunds.create({
        charge: stripeChargeId,
        reason,
        reverse_transfer: true,
        refund_application_fee: true,
        metadata: { orderId },
      });
    } catch (err) {
      this.logger.error(`Full refund failed for charge ${stripeChargeId}`, err);
      throw new InternalServerErrorException('Refund failed');
    }
  }

  async refundPartial(params: {
    stripeChargeId: string;
    amountCents: number;
    reason?: Stripe.RefundCreateParams.Reason;
    orderId: string;
  }): Promise<Stripe.Refund> {
    const {
      stripeChargeId,
      amountCents,
      reason = 'requested_by_customer',
      orderId,
    } = params;

    if (amountCents <= 0)
      throw new BadRequestException('Refund amount must be > 0');

    try {
      return await this.stripe.refunds.create({
        charge: stripeChargeId,
        amount: amountCents,
        reason,
        reverse_transfer: true,
        metadata: { orderId, partial: 'true' },
      });
    } catch (err) {
      this.logger.error(
        `Partial refund failed for charge ${stripeChargeId}`,
        err,
      );
      throw new InternalServerErrorException('Refund failed');
    }
  }

  // ── Customers ──────────────────────────────────────────────────────────────

  async createCustomer(params: {
    email: string;
    name?: string;
    userId: string;
  }): Promise<Stripe.Customer> {
    return this.stripe.customers.create({
      email: params.email,
      name: params.name,
      metadata: { userId: params.userId },
    });
  }

  async listPaymentMethods(
    stripeCustomerId: string,
  ): Promise<Stripe.ApiList<Stripe.PaymentMethod>> {
    return this.stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card',
    });
  }

  async detachPaymentMethod(
    paymentMethodId: string,
  ): Promise<Stripe.PaymentMethod> {
    return this.stripe.paymentMethods.detach(paymentMethodId);
  }

  // ── Webhooks ───────────────────────────────────────────────────────────────

  async constructWebhookEvent(
    rawBody: Buffer,
    signature: string,
  ): Promise<Stripe.Event> {
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET')!;
    try {
      return await this.stripe.webhooks.constructEventAsync(
        rawBody,
        signature,
        secret,
      );
    } catch (err) {
      this.logger.warn('Webhook signature verification failed', err);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  // ── Utilities ──────────────────────────────────────────────────────────────

  dollarsToCents(dollars: number): number {
    return Math.round(dollars * 100);
  }
}
