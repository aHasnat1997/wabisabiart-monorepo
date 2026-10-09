import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service.js';
import {
  CheckoutDto,
  MarkShippedDto,
  ProcessRefundDto,
  CancelOrderDto,
  OpenDisputeDto,
  AdminRejectCancelDto,
  AdminResolveDisputeDto,
} from './dto/order.dto.js';
import { Auth } from '../../../src/decorators/auth.decorator.js';
import { CurrentUser } from '../../../src/decorators/current-user.decorator.js';
import {
  QueryBuilder,
  ParsedQuery,
} from '../../../src/decorators/query-builder.decorator.js';
import { Order } from '@wabisabiart/db';
import { UserRole } from '@wabisabiart/db';
import { CouponsService } from '../marketing/coupons/coupons.service.js';
import { PreviewCouponDto } from '../marketing/coupons/dto/preview-coupon.dto.js';

@Controller('orders')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly couponsService: CouponsService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // CUSTOMER ROUTES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * POST /orders/coupon/preview
   * Customer previews a coupon before placing an order.
   * Reads the cart from DB automatically — no sellerId or cartTotal needed.
   * Does NOT consume the coupon (read-only).
   *
   * Body: { "code": "SAVE10" }
   *
   * Success response:
   * {
   *   valid: true,
   *   code: "SAVE10",
   *   discountType: "PERCENTAGE",
   *   discountValue: 10,
   *   discount: 5.00,
   *   freeShipping: false,
   *   appliedToSeller: "Katie's Craft Shop",
   *   sellerCartTotal: 50.00,
   *   finalSellerTotal: 45.00,
   *   otherSellers: [{ sellerId, shopName, cartTotal }]
   * }
   *
   * Failure response:
   * { valid: false, reason: "Coupon has expired" }
   */
  @Post('coupon/preview')
  @Auth(UserRole.customer, UserRole.seller)
  async previewCoupon(
    @CurrentUser('id') customerId: string,
    @Body() dto: PreviewCouponDto,
  ) {
    return this.couponsService.previewCoupon(dto.code, customerId);
  }

  /**
   * POST /orders/checkout
   * Place order from cart. Pass couponCode in body to apply the coupon.
   * The coupon is validated and consumed atomically inside the transaction.
   *
   * Body: {
   *   shippingAddressId,
   *   couponCode?,
   *   shippingCost?,
   *   customerRegion?,
   *   tipAmount?,
   *   buyerNote?,
   *   redirectUrl
   * }
   */
  @Post('checkout')
  @Auth(UserRole.customer)
  async checkout(@CurrentUser('id') userId: string, @Body() dto: CheckoutDto) {
    const result = await this.orderService.checkout(userId, dto);
    return {
      redirectUrl: dto.redirectUrl ?? null,
      data: result,
    };
  }

  /**
   * GET /orders/my
   * Customer order history.
   * Query params:
   *   ?view=unshipped       → status IN [paid, processing]
   *   ?view=undelivered     → status IN [shipped, in_transit]
   *   ?view=past            → status IN [delivered, cancelled, refunded, disputed]
   *   ?filter[status]=paid  → exact status filter
   *   ?q=ORD-2026           → search by order number / buyer note
   *   ?sort=createdAt:desc  ?page=1  ?limit=10
   */
  @Get('my')
  @Auth(UserRole.customer)
  async getMyOrders(
    @CurrentUser('id') userId: string,
    @QueryBuilder<Order>({
      searchFields: ['orderNumber', 'buyerNote'],
      enumFields: ['status'],
      defaultSort: { field: 'createdAt', order: 'desc' },
      defaultLimit: 10,
      maxLimit: 100,
    })
    parsedQuery: ParsedQuery & { page: number; limit: number },
    @Query('view') view?: string,
  ) {
    delete (parsedQuery.where as Record<string, any>)['view'];
    const result = await this.orderService.getMyOrders(
      userId,
      parsedQuery,
      view,
    );
    return {
      message: 'Successfully retrieved orders 👍',
      data: {
        items: result.data,
        page: result.meta.page,
        limit: result.meta.limit,
        total: result.meta.total,
      },
    };
  }

  /** GET /orders/my/:id – Customer order detail */
  @Get('my/:id')
  @Auth(UserRole.customer)
  async getMyOrderDetail(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
  ) {
    return await this.orderService.getMyOrderDetail(userId, orderId);
  }

  /** PATCH /orders/my/:id/cancel – Customer cancel order */
  @Patch('my/:id/cancel')
  @Auth(UserRole.customer)
  async customerCancelOrder(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
    @Body() dto: CancelOrderDto,
  ) {
    return await this.orderService.customerCancelOrder(userId, orderId, dto);
  }

  /** POST /orders/my/:id/dispute – Customer open dispute */
  @Post('my/:id/dispute')
  @Auth(UserRole.customer)
  async openDispute(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
    @Body() dto: OpenDisputeDto,
  ) {
    return await this.orderService.openDispute(userId, orderId, dto);
  }

  /** GET /orders/my/:id/history – Customer order status history */
  @Get('my/:id/history')
  @Auth(UserRole.customer)
  async getMyOrderHistory(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
  ) {
    return await this.orderService.getOrderHistory(userId, orderId, 'buyer');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SELLER ROUTES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /orders/seller
   * Seller order dashboard.
   * Query params:
   *   ?view=pending_shipment   → status IN [paid, processing]
   *   ?view=past_due           → paid/processing but paidAt > 3 days ago
   *   ?view=delivery_delays    → shipped/in_transit with overdue delivery
   *   ?view=refund_requests    → orders with open refund requests
   *   ?view=disputes           → orders with open/under_review disputes
   *   ?view=past               → status IN [delivered, cancelled, refunded]
   *   ?filter[status]=shipped  → exact status filter
   *   ?q=ORD-2026  ?sort=createdAt:desc  ?page=1  ?limit=10
   */
  @Get('seller')
  @Auth(UserRole.seller)
  async getSellerOrders(
    @CurrentUser('id') userId: string,
    @QueryBuilder<Order>({
      searchFields: ['orderNumber', 'buyerNote', 'sellerNote'],
      enumFields: ['status'],
      defaultSort: { field: 'createdAt', order: 'desc' },
      defaultLimit: 10,
      maxLimit: 100,
    })
    parsedQuery: ParsedQuery & { page: number; limit: number },
    @Query('view') view?: string,
  ) {
    delete (parsedQuery.where as Record<string, any>)['view'];
    const result = await this.orderService.getSellerOrders(
      userId,
      parsedQuery,
      view,
    );
    return {
      message: 'Successfully retrieved orders 👍',
      data: {
        items: result.data,
        page: result.meta.page,
        limit: result.meta.limit,
        total: result.meta.total,
      },
    };
  }

  /** GET /orders/seller/order-summary – Seller order summary */
  @Get('seller/order-summary')
  @Auth(UserRole.seller)
  async getSellerOrderSummary(@CurrentUser('id') userId: string) {
    return await this.orderService.getSellerOrderSummary(userId);
  }

  /** GET /orders/seller/:id – Seller order detail */
  @Get('seller/:id')
  @Auth(UserRole.seller)
  async getSellerOrderDetail(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
  ) {
    return await this.orderService.getSellerOrderDetail(userId, orderId);
  }

  /**
   * PATCH /orders/seller/:id/ship
   * Mark order as shipped. Creates shipment record.
   * Body: { carrier, trackingNumber?, trackingUrl?, estimatedDeliveryDate?, weight? }
   */
  @Patch('seller/:id/ship')
  @Auth(UserRole.seller)
  async markAsShipped(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
    @Body() dto: MarkShippedDto,
  ) {
    return await this.orderService.markAsShipped(userId, orderId, dto);
  }

  /**
   * PATCH /orders/seller/:id/deliver
   * Mark order as delivered. Decreases product variant quantities.
   */
  @Patch('seller/:id/deliver')
  @Auth(UserRole.seller)
  async markAsDelivered(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
  ) {
    return await this.orderService.markAsDelivered(userId, orderId);
  }

  /** PATCH /orders/seller/:id/cancel – Seller cancel order */
  @Patch('seller/:id/cancel')
  @Auth(UserRole.seller)
  async sellerCancelOrder(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
    @Body() dto: CancelOrderDto,
  ) {
    return await this.orderService.sellerCancelOrder(userId, orderId, dto);
  }

  /** POST /orders/seller/:id/refund – Seller process refund */
  @Post('seller/:id/refund')
  @Auth(UserRole.seller)
  async processRefund(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
    @Body() dto: ProcessRefundDto,
  ) {
    return await this.orderService.processRefund(userId, orderId, dto);
  }

  /** GET /orders/seller/:id/invoice – Download invoice data */
  @Get('seller/:id/invoice')
  @Auth(UserRole.seller)
  async getInvoice(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
  ) {
    return await this.orderService.getInvoice(userId, orderId);
  }

  /** GET /orders/seller/:id/shipping-label – Print shipping label data */
  @Get('seller/:id/shipping-label')
  @Auth(UserRole.seller)
  async getShippingLabel(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
  ) {
    return await this.orderService.getShippingLabel(userId, orderId);
  }

  /** GET /orders/seller/:id/history – Seller order status history */
  @Get('seller/:id/history')
  @Auth(UserRole.seller)
  async getSellerOrderHistory(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
  ) {
    return await this.orderService.getOrderHistory(userId, orderId, 'seller');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ADMIN ROUTES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /orders/admin
   * Admin: view all orders across all buyers/sellers.
   * Query params:
   *   ?view=cancel_requests  → internalNote starts with CANCEL_REQUESTED:
   *   ?view=disputes         → status = disputed
   *   ?view=processing       → status IN [paid, processing]
   *   ?view=shipped          → status IN [shipped, in_transit]
   *   ?view=delivered        → status = delivered
   *   ?view=cancelled        → status = cancelled
   *   ?view=refunded         → status = refunded
   *   ?filter[status]=paid   → exact status filter
   *   ?q=ORD-2026  ?sort=createdAt:desc  ?page=1  ?limit=10
   */
  @Get('admin')
  @Auth(UserRole.admin)
  async adminGetAllOrders(
    @QueryBuilder<Order>({
      searchFields: ['orderNumber', 'buyerNote', 'internalNote'],
      enumFields: ['status'],
      defaultSort: { field: 'createdAt', order: 'desc' },
      defaultLimit: 10,
      maxLimit: 100,
    })
    parsedQuery: ParsedQuery & { page: number; limit: number },
    @Query('view') view?: string,
  ) {
    delete (parsedQuery.where as Record<string, any>)['view'];
    return await this.orderService.adminGetAllOrders(parsedQuery, view);
  }

  /** GET /orders/admin/:id – Admin: full order detail */
  @Get('admin/:id')
  @Auth(UserRole.admin)
  async adminGetOrderDetail(@Param('id') orderId: string) {
    return await this.orderService.adminGetOrderDetail(orderId);
  }

  /** PATCH /orders/admin/:id/approve-cancel – Admin: approve customer cancel request */
  @Patch('admin/:id/approve-cancel')
  @Auth(UserRole.admin)
  async adminApproveCancelRequest(
    @CurrentUser('id') adminId: string,
    @Param('id') orderId: string,
  ) {
    return await this.orderService.adminApproveCancelRequest(orderId, adminId);
  }

  /** PATCH /orders/admin/:id/reject-cancel – Admin: reject customer cancel request */
  @Patch('admin/:id/reject-cancel')
  @Auth(UserRole.admin)
  async adminRejectCancelRequest(
    @CurrentUser('id') adminId: string,
    @Param('id') orderId: string,
    @Body() dto: AdminRejectCancelDto,
  ) {
    return await this.orderService.adminRejectCancelRequest(
      orderId,
      adminId,
      dto,
    );
  }

  /** PATCH /orders/admin/:id/resolve-dispute – Admin: resolve a dispute */
  @Patch('admin/:id/resolve-dispute')
  @Auth(UserRole.admin)
  async adminResolveDispute(
    @CurrentUser('id') adminId: string,
    @Param('id') orderId: string,
    @Body() dto: AdminResolveDisputeDto,
  ) {
    return await this.orderService.adminResolveDispute(orderId, adminId, dto);
  }

  /** GET /orders/admin/seller/:sellerId/order-summary – Admin: get seller order summary */
  @Get('admin/seller/:sellerId/order-summary')
  @Auth(UserRole.admin)
  async adminGetSellerOrderSummary(@Param('sellerId') sellerId: string) {
    return await this.orderService.getAdminSellerOrderSummary(sellerId);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // REFUND ROUTES
  // ─────────────────────────────────────────────────────────────────────────────

  /** POST /orders/my/:id/refund-request – Customer: request a refund */
  @Post('my/:id/refund-request')
  @Auth(UserRole.customer)
  async customerRequestRefund(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
    @Body() dto: ProcessRefundDto,
  ) {
    return await this.orderService.customerRequestRefund(userId, orderId, dto);
  }

  /** GET /orders/admin/payouts/pending – Admin: list paid orders awaiting payout release */
  @Get('admin/payouts/pending')
  @Auth(UserRole.admin)
  async adminListPendingPayouts() {
    return await this.orderService.adminListPendingPayouts();
  }

  /** POST /orders/admin/:id/release-payout – Admin: approve and release Stripe transfer to seller */
  @Post('admin/:id/release-payout')
  @Auth(UserRole.admin)
  async adminReleaseSellerPayout(
    @CurrentUser('id') adminId: string,
    @Param('id') orderId: string,
  ) {
    return await this.orderService.adminApproveSellerPayout(orderId, adminId);
  }

  /** GET /orders/admin/refund-requests – Admin: list all pending refund requests */
  @Get('admin/refund-requests')
  @Auth(UserRole.admin)
  async adminListRefundRequests() {
    return await this.orderService.adminListRefundRequests();
  }

  /** PATCH /orders/admin/refunds/:refundId/approve – Admin: approve refund (triggers Stripe) */
  @Patch('admin/refunds/:refundId/approve')
  @Auth(UserRole.admin)
  async adminApproveRefund(
    @CurrentUser('id') adminId: string,
    @Param('refundId') refundId: string,
  ) {
    return await this.orderService.adminApproveRefund(refundId, adminId);
  }

  /** PATCH /orders/admin/refunds/:refundId/reject – Admin: reject refund request */
  @Patch('admin/refunds/:refundId/reject')
  @Auth(UserRole.admin)
  async adminRejectRefund(
    @CurrentUser('id') adminId: string,
    @Param('refundId') refundId: string,
    @Body() dto: AdminRejectCancelDto,
  ) {
    return await this.orderService.adminRejectRefund(refundId, adminId, dto);
  }
}
