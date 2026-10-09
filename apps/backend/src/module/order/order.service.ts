/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  CheckoutDto,
  MarkShippedDto,
  ProcessRefundDto,
  CancelOrderDto,
  OpenDisputeDto,
  AdminRejectCancelDto,
  AdminResolveDisputeDto,
} from './dto/order.dto.js';
import { PrismaService } from '@wabisabiart/db';
import {
  executeQuery,
  ParsedQuery,
} from '../../../src/decorators/query-builder.decorator.js';
import {
  OrderStatus,
  ShipmentStatus,
} from '@wabisabiart/db';
import { DiscountEngineService } from '../marketing/discount-engine/discount-engine.service.js';
import { CouponsService } from '../marketing/coupons/coupons.service.js';
import { FreeShippingService } from '../marketing/free-shipping/free-shipping.service.js';
import { WishlistCouponsService } from '../marketing/wishlist-coupons/wishlist-coupons.service.js';
import { StripeService } from '../stripe/stripe.service.js';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly discountEngine: DiscountEngineService,
    private readonly couponsService: CouponsService,
    private readonly freeShippingService: FreeShippingService,
    private readonly wishlistCouponsService: WishlistCouponsService,
    private readonly stripeService: StripeService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private generateOrderNumber(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = Math.random().toString(36).toUpperCase().slice(2, 8);
    return `ORD-${y}${m}${d}-${rand}`;
  }

  private toSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // ─── CUSTOMER: Checkout from cart ──────────────────────────────────────────

  async checkout(userId: string, dto: CheckoutDto) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                discountType: true,
                discountValue: true,
                category: {
                  select: {
                    name: true,
                  },
                },
                seller: {
                  select: {
                    sellerProfile: { select: { id: true, shopName: true } },
                  },
                },
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Group items by seller profile and validate stock
    const itemsBySellerProfile = new Map<string, typeof cart.items>();
    for (const item of cart.items) {
      const sellerProfileId = item.product.seller.sellerProfile?.id;
      if (!sellerProfileId) {
        throw new BadRequestException(
          `Seller for product "${item.product.title}" does not have a seller profile`,
        );
      }
      if (item.variant && item.variant.quantity < item.quantity) {
        throw new BadRequestException(
          `Not enough stock for "${item.variant.name}"`,
        );
      }
      if (!itemsBySellerProfile.has(sellerProfileId)) {
        itemsBySellerProfile.set(sellerProfileId, []);
      }
      itemsBySellerProfile.get(sellerProfileId)!.push(item);
    }

    // Verify shipping address belongs to buyer
    const address = await this.prisma.address.findFirst({
      where: { id: dto.shippingAddressId, userId },
    });
    if (!address) {
      throw new BadRequestException('Shipping address not found');
    }

    const orders = await this.prisma.$transaction(async (tx) => {
      const txAny = tx as any;
      const createdOrders: Record<string, unknown>[] = [];

      for (const [sellerProfileId, items] of itemsBySellerProfile) {
        // Calculate amounts
        let itemsTotal = 0;
        let discountAmount = 0;
        for (const item of items) {
          const price = Number(item.product.price || 0);
          const qty = item.quantity;
          itemsTotal += price * qty;
          const dv = Number(item.product.discountValue || 0);
          if (item.product.discountType === 'fixed_amount') {
            discountAmount += dv * qty;
          } else if (item.product.discountType === 'percentage') {
            discountAmount += (price * qty * dv) / 100;
          }
        }

        const subtotal = Math.max(0, itemsTotal - discountAmount);

        // Apply promotional discount (via discount engine)
        const orderItemsForEngine = items.map((item) => ({
          productId: item.product.id,
          category: item.product.category?.name,
          quantity: item.quantity,
          price: Number(item.product.price || 0),
        }));
        const { discount: promotionalDiscount, appliedPromotion } =
          await this.discountEngine.applyBestPromotion(
            sellerProfileId,
            orderItemsForEngine,
            userId,
          );

        let couponDiscount = 0;
        let couponFreeShipping = false;
        const tipAmount = parseFloat(dto.tipAmount || '0') || 0;

        const shippingResult = await this.freeShippingService.checkFreeShipping(
          sellerProfileId,
          subtotal,
          dto.customerRegion ?? 'Unknown',
        );
        let shippingCost = shippingResult.freeShipping
          ? 0
          : (dto.shippingCost ?? 0);

        let finalTotal = Math.max(0, subtotal - promotionalDiscount);
        let totalAmount = finalTotal + shippingCost + tipAmount;

        const order = await tx.order.create({
          data: {
            orderNumber: this.generateOrderNumber(),
            buyerId: userId,
            sellerId: sellerProfileId,
            status: OrderStatus.pending_payment,
            subtotal: subtotal.toFixed(2),
            shippingCost: shippingCost.toFixed(2),
            taxAmount: '0.00',
            discountAmount: (discountAmount + promotionalDiscount).toFixed(2),
            tipAmount: tipAmount.toFixed(2),
            totalAmount: totalAmount.toFixed(2),
            currency: 'USD',
            shippingAddressId: dto.shippingAddressId,
            buyerNote: dto.buyerNote,
            couponCode: dto.couponCode,
            markOrderAsGift: dto.markOrderAsGift,
            items: {
              create: items.map((item) => ({
                productId: item.product.id,
                variantId: item.variantId,
                productTitle: item.product.title || '',
                productSlug: this.toSlug(item.product.title || item.product.id),
                variantName: item.variant?.name,
                imageUrl: item.variant?.mediaUrl,
                quantity: item.quantity,
                unitPrice: item.product.price || 0,
                totalPrice: (
                  Number(item.product.price || 0) * item.quantity
                ).toFixed(2),
                customization: item.customization,
              })),
            },
          },
          include: { items: true },
        });

        if (dto.couponCode) {
          const couponResult = await this.couponsService.validateAndApply(
            dto.couponCode,
            sellerProfileId,
            order.id,
            userId,
            subtotal,
            tx,
          );

          if (couponResult.valid) {
            couponDiscount = couponResult.discount;
            couponFreeShipping = couponResult.freeShipping;

            // Set the couponId FK on the order
            await tx.order.update({
              where: { id: order.id },
              data: { couponId: couponResult.coupon.id },
            });

            if (dto.couponCode.startsWith('WISH-')) {
              await this.wishlistCouponsService.onCouponRedeemed(
                dto.couponCode,
                sellerProfileId,
                couponResult.discount,
                tx,
              );
            }
          }
        }

        // FREE_SHIPPING coupon overrides shipping cost
        if (couponFreeShipping) {
          shippingCost = 0;
        }

        finalTotal = Math.max(
          0,
          subtotal - promotionalDiscount - couponDiscount,
        );
        totalAmount = finalTotal + shippingCost + tipAmount;

        const orderAfterAdjustments = await tx.order.update({
          where: { id: order.id },
          data: {
            couponCode: dto.couponCode,
            discountAmount: (
              discountAmount +
              promotionalDiscount +
              couponDiscount
            ).toFixed(2),
            totalAmount: totalAmount.toFixed(2),
            shippingCost: shippingCost.toFixed(2),
          },
          include: { items: true },
        });

        // If a promotion was applied, log the usage and increment the counter
        if (appliedPromotion) {
          await txAny.promotionUsageLog.create({
            data: {
              promotionId: appliedPromotion.id,
              orderId: order.id,
              customerId: userId,
              discountAmount: promotionalDiscount.toFixed(2),
            },
          });

          // Increment usage count atomically
          await txAny.promotion.update({
            where: { id: appliedPromotion.id },
            data: {
              usageCount: {
                increment: 1,
              },
            },
          });
        }

        if (shippingResult.freeShipping && shippingResult.reason === 'rule') {
          await txAny.freeShippingRule.updateMany({
            where: {
              sellerId: sellerProfileId,
              name: shippingResult.ruleName,
              isActive: true,
            },
            data: {
              orderCount: {
                increment: 1,
              },
            },
          });
        }

        if (shippingResult.freeShipping && shippingResult.reason === 'global') {
          await txAny.globalFreeShippingConfig.updateMany({
            where: {
              sellerId: sellerProfileId,
              isEnabled: true,
            },
            data: {
              triggerCount: {
                increment: 1,
              },
            },
          });
        }

        // Initial status history — payment confirmed via Stripe webhook
        await tx.orderStatusHistory.create({
          data: {
            orderId: orderAfterAdjustments.id,
            status: OrderStatus.pending_payment,
            note: 'Order created — awaiting Stripe payment',
            createdBy: userId,
          },
        });

        createdOrders.push(orderAfterAdjustments);
      }

      // Clear customer cart after successful checkout
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return createdOrders;
    });

    return orders;
  }

  // ─── CUSTOMER: List my orders ──────────────────────────────────────────────

  async getMyOrders(
    userId: string,
    parsedQuery: ParsedQuery & { page: number; limit: number },
    view?: string,
  ) {
    const baseWhere = { ...(parsedQuery.where as Record<string, any>) };
    delete baseWhere['view'];
    const viewFilter = this.resolveCustomerViewFilter(view);

    const where = { ...baseWhere, ...viewFilter, buyerId: userId };
    const finalQuery = { ...parsedQuery, where };
    const defaultInclude = parsedQuery.select
      ? undefined
      : {
          items: {
            include: {
              variant: { select: { id: true, name: true, mediaUrl: true } },
            },
          },
          shipments: {
            select: {
              status: true,
              trackingNumber: true,
              carrier: true,
              estimatedDeliveryDate: true,
            },
          },
          payments: {
            select: { status: true, amount: true, processedAt: true },
          },
          refunds: {
            select: { status: true, amount: true, requestedAt: true },
          },
          seller: { select: { shopName: true, shopLogo: true } },
        };

    return executeQuery(this.prisma.order, {
      ...finalQuery,
      ...(defaultInclude && { include: defaultInclude }),
    });
  }

  // ─── CUSTOMER: Order detail ────────────────────────────────────────────────

  async getMyOrderDetail(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, buyerId: userId },
      include: {
        items: {
          include: {
            product: { select: { id: true, title: true } },
            variant: true,
          },
        },
        shippingAddress: true,
        payments: true,
        shipments: { include: { trackingUpdates: true } },
        refunds: true,
        disputes: { include: { messages: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
        seller: { select: { id: true, shopName: true, shopLogo: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // ─── CUSTOMER: Request cancel (admin must approve) ────────────────────────

  async customerCancelOrder(
    userId: string,
    orderId: string,
    dto: CancelOrderDto,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, buyerId: userId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const requestable: OrderStatus[] = [
      OrderStatus.pending_payment,
      OrderStatus.paid,
      OrderStatus.processing,
      OrderStatus.shipped,
    ];
    if (!requestable.includes(order.status)) {
      throw new BadRequestException(
        `Cancel request not allowed at status: ${order.status}`,
      );
    }
    if (order.internalNote?.startsWith('CANCEL_REQUESTED:')) {
      throw new BadRequestException(
        'A cancel request is already pending for this order',
      );
    }

    const reason = dto.note || 'No reason provided';
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { internalNote: `CANCEL_REQUESTED: ${reason}` },
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: 'processing',
          note: `Cancel requested by customer: ${reason}`,
          createdBy: userId,
        },
      });
      return updated;
    });
  }

  // ─── CUSTOMER: Open dispute ────────────────────────────────────────────────

  async openDispute(userId: string, orderId: string, dto: OpenDisputeDto) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, buyerId: userId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (
      order.status === OrderStatus.cancelled ||
      order.status === OrderStatus.refunded
    ) {
      throw new BadRequestException(
        'Cannot open dispute on a cancelled or refunded order',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const dispute = await tx.dispute.create({
        data: {
          orderId,
          reason: dto.reason,
          description: dto.description,
          openedBy: userId,
        },
      });
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.disputed },
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: OrderStatus.disputed,
          note: `Dispute opened: ${dto.reason}`,
          createdBy: userId,
        },
      });
      return dispute;
    });
  }

  // ─── SELLER: List seller orders ────────────────────────────────────────────

  async getSellerOrders(
    userId: string,
    parsedQuery: ParsedQuery & { page: number; limit: number },
    view?: string,
  ) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (!sellerProfile) throw new NotFoundException('Seller profile not found');

    const baseWhere = { ...(parsedQuery.where as Record<string, any>) };
    delete baseWhere['view'];
    const viewFilter = this.resolveSellerViewFilter(view);

    const where = { ...baseWhere, ...viewFilter, sellerId: sellerProfile.id };
    const finalQuery = { ...parsedQuery, where };
    const defaultInclude = parsedQuery.select
      ? undefined
      : {
          buyer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
          items: {
            include: {
              variant: { select: { id: true, name: true, mediaUrl: true } },
            },
          },
          shipments: {
            select: {
              status: true,
              carrier: true,
              trackingNumber: true,
              estimatedDeliveryDate: true,
            },
          },
          payments: {
            select: { status: true, amount: true, processedAt: true },
          },
          refunds: {
            select: { status: true, amount: true, requestedAt: true },
          },
          disputes: {
            select: { status: true, reason: true, openedAt: true },
          },
        };

    return executeQuery(this.prisma.order, {
      ...finalQuery,
      ...(defaultInclude && { include: defaultInclude }),
    });
  }

  // ─── SELLER: All orders summary ────────────────────────────────────────────
  async getSellerOrderSummary(userId: string) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (!sellerProfile) throw new NotFoundException('Seller profile not found');

    // Fetch all aggregated data in parallel
    const [totalOrders, pendingShipments, cancelledOrders, revenueData] =
      await Promise.all([
        this.prisma.order.count({
          where: { sellerId: sellerProfile.id },
        }),
        this.prisma.order.count({
          where: {
            sellerId: sellerProfile.id,
            status: { in: [OrderStatus.paid, OrderStatus.processing] },
          },
        }),
        this.prisma.order.count({
          where: {
            sellerId: sellerProfile.id,
            status: OrderStatus.cancelled,
          },
        }),
        this.prisma.order.aggregate({
          where: { sellerId: sellerProfile.id },
          _sum: { totalAmount: true },
        }),
      ]);

    return {
      totalOrders,
      pendingShipment: pendingShipments,
      cancelledOrders,
      totalRevenue: revenueData._sum.totalAmount || '0.00',
    };
  }

  // ─── ADMIN: Get seller order summary by seller ID ─────────────────────────

  async getAdminSellerOrderSummary(sellerId: string) {
    // Fetch all aggregated data in parallel
    const [totalOrders, pendingShipments, cancelledOrders, revenueData] =
      await Promise.all([
        this.prisma.order.count({
          where: { sellerId },
        }),
        this.prisma.order.count({
          where: {
            sellerId,
            status: { in: [OrderStatus.paid, OrderStatus.processing] },
          },
        }),
        this.prisma.order.count({
          where: {
            sellerId,
            status: OrderStatus.cancelled,
          },
        }),
        this.prisma.order.aggregate({
          where: { sellerId },
          _sum: { totalAmount: true },
        }),
      ]);

    return {
      totalOrders,
      pendingShipment: pendingShipments,
      cancelledOrders,
      totalRevenue: revenueData._sum.totalAmount || '0.00',
    };
  }

  // ─── SELLER: Order detail ──────────────────────────────────────────────────

  async getSellerOrderDetail(userId: string, orderId: string) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (!sellerProfile) throw new NotFoundException('Seller profile not found');

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, sellerId: sellerProfile.id },
      include: {
        buyer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            phoneNumber: true,
          },
        },
        items: {
          include: {
            product: { select: { id: true, title: true, price: true } },
            variant: true,
          },
        },
        shippingAddress: true,
        payments: true,
        shipments: { include: { trackingUpdates: true } },
        refunds: true,
        disputes: { include: { messages: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // ─── SELLER: Mark order as shipped ────────────────────────────────────────

  async markAsShipped(userId: string, orderId: string, dto: MarkShippedDto) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (!sellerProfile) throw new NotFoundException('Seller profile not found');

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, sellerId: sellerProfile.id },
    });
    if (!order) throw new NotFoundException('Order not found');

    const shippable: OrderStatus[] = [OrderStatus.paid, OrderStatus.processing];
    if (!shippable.includes(order.status)) {
      throw new BadRequestException(
        `Cannot ship order at status: ${order.status}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const shipment = await tx.shipment.create({
        data: {
          orderId,
          carrier: dto.carrier,
          trackingNumber: dto.trackingNumber,
          trackingUrl: dto.trackingUrl,
          status: ShipmentStatus.label_created,
          weight: dto.weight ? String(dto.weight) : undefined,
          estimatedDeliveryDate: dto.estimatedDeliveryDate
            ? new Date(dto.estimatedDeliveryDate)
            : undefined,
          shippedAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.shipped, shippedAt: new Date() },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: OrderStatus.shipped,
          note: `Shipped via ${dto.carrier}${dto.trackingNumber ? ` – tracking: ${dto.trackingNumber}` : ''}`,
          createdBy: userId,
        },
      });

      this.eventEmitter.emit('order.shipped', {
        buyerId: order.buyerId,
        orderNumber: order.orderNumber,
        orderId: orderId,
      });

      return shipment;
    });
  }

  // ─── SELLER: Mark order as delivered ──────────────────────────────────────

  async markAsDelivered(userId: string, orderId: string) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (!sellerProfile) throw new NotFoundException('Seller profile not found');

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, sellerId: sellerProfile.id },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    const deliverable: OrderStatus[] = [
      OrderStatus.shipped,
      OrderStatus.in_transit,
    ];
    if (!deliverable.includes(order.status)) {
      throw new BadRequestException(
        `Cannot mark as delivered at status: ${order.status}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.delivered, deliveredAt: new Date() },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: OrderStatus.delivered,
          note: 'Order delivered',
          createdBy: userId,
        },
      });

      await tx.shipment.updateMany({
        where: { orderId },
        data: {
          status: ShipmentStatus.delivered,
          actualDeliveryDate: new Date(),
        },
      });

      // Decrease product variant quantities (post-delivery)
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { quantity: { decrement: item.quantity } },
          });
          // Refresh low-stock flag
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            select: {
              quantity: true,
              product: { select: { lowStockThreshold: true } },
            },
          });
          if (
            variant &&
            variant.quantity <= (variant.product.lowStockThreshold ?? 5)
          ) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { isLowStock: true },
            });
          }
        }
        // Increment salesCount regardless of variant
        await tx.product.update({
          where: { id: item.productId },
          data: { salesCount: { increment: item.quantity } },
        });
      }

      this.eventEmitter.emit('order.delivered', {
        buyerId: order.buyerId,
        orderNumber: order.orderNumber,
        orderId: orderId,
      });

      return { message: 'Order marked as delivered' };
    });
  }

  // ─── SELLER: Cancel order ──────────────────────────────────────────────────

  async sellerCancelOrder(
    userId: string,
    orderId: string,
    dto: CancelOrderDto,
  ) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (!sellerProfile) throw new NotFoundException('Seller profile not found');

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, sellerId: sellerProfile.id },
    });
    if (!order) throw new NotFoundException('Order not found');

    const cancellable: OrderStatus[] = [
      OrderStatus.pending_payment,
      OrderStatus.paid,
      OrderStatus.processing,
    ];
    if (!cancellable.includes(order.status)) {
      throw new BadRequestException(
        `Order cannot be cancelled at status: ${order.status}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.cancelled, cancelledAt: new Date() },
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: OrderStatus.processing,
          note: dto.note || 'Cancelled by seller',
          createdBy: userId,
        },
      });

      this.eventEmitter.emit('order.cancelled', {
        buyerId: order.buyerId,
        orderNumber: order.orderNumber,
        orderId: orderId,
      });

      return updated;
    });
  }

  // ─── SELLER: Process refund ────────────────────────────────────────────────

  async processRefund(userId: string, orderId: string, dto: ProcessRefundDto) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (!sellerProfile) throw new NotFoundException('Seller profile not found');

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, sellerId: sellerProfile.id },
    });
    if (!order) throw new NotFoundException('Order not found');

    const existing = await this.prisma.refund.findFirst({
      where: {
        orderId,
        status: { in: ['requested', 'approved', 'processing'] },
      },
    });
    if (existing)
      throw new BadRequestException(
        'A refund request already exists for this order',
      );

    return this.prisma.refund.create({
      data: {
        orderId,
        amount: dto.amount,
        reason: dto.reason,
        status: 'requested',
        requestedBy: userId,
      },
    });
  }

  // ─── CUSTOMER: Request refund ──────────────────────────────────────────────

  async customerRequestRefund(
    userId: string,
    orderId: string,
    dto: ProcessRefundDto,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, buyerId: userId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const refundable: OrderStatus[] = [
      OrderStatus.paid,
      OrderStatus.processing,
      OrderStatus.shipped,
      OrderStatus.delivered,
    ];
    if (!refundable.includes(order.status)) {
      throw new BadRequestException(
        `Refund not allowed at status: ${order.status}`,
      );
    }

    const existing = await this.prisma.refund.findFirst({
      where: {
        orderId,
        status: { in: ['requested', 'approved', 'processing'] },
      },
    });
    if (existing)
      throw new BadRequestException(
        'A refund request already exists for this order',
      );

    return this.prisma.refund.create({
      data: {
        orderId,
        amount: dto.amount,
        reason: dto.reason,
        status: 'requested',
        requestedBy: userId,
      },
    });
  }

  // ─── ADMIN: List refund requests ───────────────────────────────────────────

  async adminListRefundRequests() {
    return this.prisma.refund.findMany({
      where: { status: 'requested' },
      include: {
        order: {
          include: {
            buyer: { select: { fullName: true, email: true, avatarUrl: true } },
            seller: { select: { shopName: true, shopLogo: true } },
            items: {
              select: {
                productTitle: true,
                quantity: true,
                totalPrice: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: { requestedAt: 'desc' },
    });
  }

  // ─── ADMIN: Approve refund (triggers Stripe) ───────────────────────────────

  async adminApproveRefund(refundId: string, adminId: string) {
    const refund = await this.prisma.refund.findUnique({
      where: { id: refundId },
      include: { order: true },
    });
    if (!refund) throw new NotFoundException('Refund not found');
    if (refund.status !== 'requested')
      throw new BadRequestException('Refund is not in requested state');

    const order = refund.order;
    if (!order.stripeChargeId)
      throw new BadRequestException(
        'No Stripe charge found — cannot process refund',
      );

    const amountCents = this.stripeService.dollarsToCents(
      Number(refund.amount),
    );
    const stripeRefund = await this.stripeService.refundPartial({
      stripeChargeId: order.stripeChargeId,
      amountCents,
      orderId: order.id,
    });

    return this.prisma.$transaction(async (tx) => {
      await tx.refund.update({
        where: { id: refundId },
        data: {
          status: 'completed',
          processedBy: adminId,
          processedAt: new Date(),
          completedAt: new Date(),
          providerRefundId: stripeRefund.id,
        },
      });

      const isFullRefund = Number(refund.amount) >= Number(order.totalAmount);

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: isFullRefund ? OrderStatus.refunded : OrderStatus.refunded,
          refundCompletedAt: new Date(),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: OrderStatus.refunded,
          note: `Refund approved by admin. Stripe refund: ${stripeRefund.id}`,
          createdBy: adminId,
        },
      });

      return { message: 'Refund processed', stripeRefundId: stripeRefund.id };
    });
  }

  // ─── ADMIN: Reject refund ──────────────────────────────────────────────────

  async adminRejectRefund(
    refundId: string,
    adminId: string,
    dto: AdminRejectCancelDto,
  ) {
    const refund = await this.prisma.refund.findUnique({
      where: { id: refundId },
    });
    if (!refund) throw new NotFoundException('Refund not found');
    if (refund.status !== 'requested')
      throw new BadRequestException('Refund is not in requested state');

    return this.prisma.refund.update({
      where: { id: refundId },
      data: {
        status: 'rejected',
        processedBy: adminId,
        processedAt: new Date(),
        rejectionReason: dto.reason,
      },
    });
  }

  // ─── SELLER: Invoice ───────────────────────────────────────────────────────

  async getInvoice(userId: string, orderId: string) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (!sellerProfile) throw new NotFoundException('Seller profile not found');

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, sellerId: sellerProfile.id },
      include: {
        buyer: { select: { fullName: true, email: true } },
        items: true,
        shippingAddress: true,
        payments: {
          select: {
            amount: true,
            status: true,
            processedAt: true,
            provider: true,
          },
        },
        seller: {
          select: { shopName: true, shopLogo: true, address: true },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    return {
      invoiceNumber: `INV-${order.orderNumber}`,
      issuedAt: new Date().toISOString(),
      order: {
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        paidAt: order.paidAt,
        status: order.status,
      },
      seller: order.seller,
      buyer: order.buyer,
      shippingAddress: order.shippingAddress,
      lineItems: order.items.map((i) => ({
        productTitle: i.productTitle,
        variantName: i.variantName,
        sku: i.sku,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
      })),
      summary: {
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        taxAmount: order.taxAmount,
        discountAmount: order.discountAmount,
        tipAmount: order.tipAmount,
        totalAmount: order.totalAmount,
        currency: order.currency,
      },
      payment: order.payments[0] ?? null,
    };
  }

  // ─── SELLER: Shipping label ────────────────────────────────────────────────

  async getShippingLabel(userId: string, orderId: string) {
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
    if (!sellerProfile) throw new NotFoundException('Seller profile not found');

    const order = await this.prisma.order.findFirst({
      where: { id: orderId, sellerId: sellerProfile.id },
      include: {
        buyer: { select: { fullName: true, email: true } },
        shippingAddress: true,
        items: {
          select: {
            productTitle: true,
            variantName: true,
            sku: true,
            quantity: true,
          },
        },
        shipments: { orderBy: { createdAt: 'desc' }, take: 1 },
        seller: { select: { shopName: true, address: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    const shipment = order.shipments[0] ?? null;
    return {
      orderNumber: order.orderNumber,
      carrier: shipment?.carrier ?? 'N/A',
      trackingNumber: shipment?.trackingNumber ?? null,
      trackingUrl: shipment?.trackingUrl ?? null,
      weight: shipment?.weight ?? null,
      shipFrom: {
        shopName: order.seller.shopName,
        address: order.seller.address,
      },
      shipTo: order.shippingAddress,
      items: order.items,
      estimatedDelivery: shipment?.estimatedDeliveryDate ?? null,
    };
  }

  // ─── SHARED: Order status history ─────────────────────────────────────────

  async getOrderHistory(
    userId: string,
    orderId: string,
    role: 'buyer' | 'seller',
  ) {
    let hasAccess = false;
    if (role === 'buyer') {
      const order = await this.prisma.order.findFirst({
        where: { id: orderId, buyerId: userId },
        select: { id: true },
      });
      hasAccess = !!order;
    } else {
      const sp = await this.prisma.sellerProfile.findUnique({
        where: { userId },
      });
      if (sp) {
        const order = await this.prisma.order.findFirst({
          where: { id: orderId, sellerId: sp.id },
          select: { id: true },
        });
        hasAccess = !!order;
      }
    }
    if (!hasAccess) throw new NotFoundException('Order not found');

    return this.prisma.orderStatusHistory.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ─── View filter helpers ───────────────────────────────────────────────────

  private resolveCustomerViewFilter(view?: string): Record<string, any> {
    switch (view) {
      case 'unshipped':
        return {
          status: { in: [OrderStatus.paid, OrderStatus.processing] },
        };
      case 'undelivered':
        return {
          status: { in: [OrderStatus.shipped, OrderStatus.in_transit] },
        };
      case 'past':
        return {
          status: {
            in: [
              OrderStatus.delivered,
              OrderStatus.cancelled,
              OrderStatus.refunded,
              OrderStatus.disputed,
            ],
          },
        };
      default:
        return {};
    }
  }

  private resolveSellerViewFilter(view?: string): Record<string, any> {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    switch (view) {
      case 'pending_shipment':
        return { status: { in: [OrderStatus.paid, OrderStatus.processing] } };
      case 'past_due':
        return {
          status: { in: [OrderStatus.paid, OrderStatus.processing] },
          paidAt: { lt: threeDaysAgo },
        };
      case 'delivery_delays':
        return {
          status: { in: [OrderStatus.shipped, OrderStatus.in_transit] },
          shipments: {
            some: {
              estimatedDeliveryDate: { lt: now },
              actualDeliveryDate: null,
            },
          },
        };
      case 'refund_requests':
        return { refunds: { some: { status: 'requested' } } };
      case 'disputes':
        return {
          disputes: { some: { status: { in: ['open', 'under_review'] } } },
        };
      case 'past':
        return {
          status: {
            in: [
              OrderStatus.delivered,
              OrderStatus.cancelled,
              OrderStatus.refunded,
            ],
          },
        };
      default:
        return {};
    }
  }

  // ─── ADMIN: List all orders ────────────────────────────────────────────────

  async adminGetAllOrders(
    parsedQuery: ParsedQuery & { page: number; limit: number },
    view?: string,
  ) {
    const baseWhere = { ...(parsedQuery.where as Record<string, any>) };
    delete baseWhere['view'];
    const viewFilter = this.resolveAdminViewFilter(view);
    const where = { ...baseWhere, ...viewFilter };
    const finalQuery = { ...parsedQuery, where };
    const defaultInclude = parsedQuery.select
      ? undefined
      : {
          buyer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatarUrl: true,
            },
          },
          seller: {
            select: { id: true, shopName: true, shopLogo: true },
          },
          items: {
            select: {
              productTitle: true,
              variantName: true,
              imageUrl: true,
              quantity: true,
              unitPrice: true,
              totalPrice: true,
            },
          },
          payments: {
            select: { status: true, amount: true, processedAt: true },
          },
          shipments: {
            select: { status: true, carrier: true, trackingNumber: true },
          },
          refunds: {
            select: { status: true, amount: true, requestedAt: true },
          },
          disputes: { select: { status: true, reason: true, openedAt: true } },
        };
    return executeQuery(this.prisma.order, {
      ...finalQuery,
      ...(defaultInclude && { include: defaultInclude }),
    });
  }

  // ─── ADMIN: Order detail ──────────────────────────────────────────────────

  async adminGetOrderDetail(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            phoneNumber: true,
          },
        },
        seller: {
          select: { id: true, shopName: true, shopLogo: true, address: true },
        },
        items: {
          include: {
            product: { select: { id: true, title: true } },
            variant: true,
          },
        },
        shippingAddress: true,
        payments: true,
        shipments: { include: { trackingUpdates: true } },
        refunds: true,
        disputes: { include: { messages: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // ─── ADMIN: Approve cancel request ────────────────────────────────────────

  async adminApproveCancelRequest(orderId: string, adminId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (!order.internalNote?.startsWith('CANCEL_REQUESTED:')) {
      throw new BadRequestException(
        'No pending cancel request found for this order',
      );
    }
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.cancelled,
          cancelledAt: new Date(),
          internalNote: 'CANCEL_APPROVED',
        },
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: OrderStatus.cancelled,
          note: 'Cancel request approved by admin',
          createdBy: adminId,
        },
      });

      this.eventEmitter.emit('order.cancelled', {
        buyerId: order.buyerId,
        orderNumber: order.orderNumber,
        orderId: orderId,
      });

      return updated;
    });
  }

  // ─── ADMIN: Reject cancel request ─────────────────────────────────────────

  async adminRejectCancelRequest(
    orderId: string,
    adminId: string,
    dto: AdminRejectCancelDto,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (!order.internalNote?.startsWith('CANCEL_REQUESTED:')) {
      throw new BadRequestException(
        'No pending cancel request found for this order',
      );
    }
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { internalNote: `CANCEL_REJECTED: ${dto.reason}` },
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: order.status,
          note: `Cancel request rejected by admin: ${dto.reason}`,
          createdBy: adminId,
        },
      });
      return updated;
    });
  }

  // ─── ADMIN: Resolve dispute ────────────────────────────────────────────────

  async adminResolveDispute(
    orderId: string,
    adminId: string,
    dto: AdminResolveDisputeDto,
  ) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, status: OrderStatus.disputed },
      include: {
        disputes: {
          where: { status: { in: ['open' as any, 'under_review' as any] } },
          take: 1,
        },
      },
    });
    if (!order) throw new NotFoundException('Order not in disputed status');
    if (!order.disputes.length)
      throw new BadRequestException('No open dispute found for this order');

    const dispute = order.disputes[0];
    const newOrderStatus =
      dto.outcome === 'resolved_buyer'
        ? OrderStatus.refunded
        : OrderStatus.delivered;

    return this.prisma.$transaction(async (tx) => {
      await tx.dispute.update({
        where: { id: dispute.id },
        data: {
          status: dto.outcome,
          resolution: dto.resolution,
          resolvedBy: adminId,
          resolvedAt: new Date(),
        },
      });
      await tx.order.update({
        where: { id: orderId },
        data: { status: newOrderStatus },
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: newOrderStatus,
          note: `Dispute resolved by admin: ${dto.resolution} (outcome: ${dto.outcome})`,
          createdBy: adminId,
        },
      });
      return {
        message: 'Dispute resolved',
        outcome: dto.outcome,
        newOrderStatus,
      };
    });
  }

  // ─── ADMIN: List pending seller payouts ────────────────────────────────────

  async adminListPendingPayouts() {
    return this.prisma.order.findMany({
      where: {
        status: 'paid',
        NOT: { internalNote: 'PAYOUT_RELEASED' },
        // allow either a charge id or a payment intent (older orders may have only the intent)
        OR: [
          { stripeChargeId: { not: null } },
          { stripePaymentIntentId: { not: null } },
        ],
        // require seller to have a connected account id; don't hide items where onboarding isn't finished
        seller: { stripeAccountId: { not: null } },
      },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        currency: true,
        paidAt: true,
        stripeChargeId: true,
        stripePaymentIntentId: true,
        buyer: { select: { fullName: true, email: true } },
        seller: {
          select: {
            id: true,
            shopName: true,
            stripeAccountId: true,
            stripeOnboardingDone: true,
          },
        },
        items: {
          select: { productTitle: true, quantity: true, totalPrice: true },
        },
      },
      orderBy: { paidAt: 'asc' },
    });
  }

  // ─── ADMIN: Approve seller payout ─────────────────────────────────────────

  async adminApproveSellerPayout(orderId: string, adminId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { seller: true },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'paid')
      throw new BadRequestException(
        'Order must be in paid status to release payout',
      );
    if (order.internalNote === 'PAYOUT_RELEASED')
      throw new BadRequestException('Payout already released for this order');

    let sourceChargeId = order.stripeChargeId;
    // Recover missing charge ID from payment intent for older paid orders.
    if (!sourceChargeId && order.stripePaymentIntentId) {
      try {
        const intent = await this.stripeService.retrievePaymentIntent(
          order.stripePaymentIntentId,
        );
        sourceChargeId = (intent.latest_charge as string | null) ?? null;
      } catch {
        sourceChargeId = null;
      }
    }

    if (!sourceChargeId)
      throw new BadRequestException('No Stripe charge found — cannot transfer');

    const seller = order.seller;
    if (!seller.stripeAccountId || !seller.stripeOnboardingDone)
      throw new BadRequestException('Seller Stripe account is not ready');

    const amountCents = this.stripeService.dollarsToCents(
      Number(order.totalAmount),
    );

    await this.stripeService.transferToSeller({
      amountCents,
      currency: order.currency.toLowerCase(),
      sellerStripeAccountId: seller.stripeAccountId,
      sourceChargeId,
      orderId: order.id,
      idempotencyKey: `transfer-${order.id}`,
    });

    return this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          internalNote: 'PAYOUT_RELEASED',
          ...(order.stripeChargeId
            ? {}
            : {
                stripeChargeId: sourceChargeId,
              }),
        },
      });
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: order.status,
          note: 'Seller payout released by admin via Stripe transfer',
          createdBy: adminId,
        },
      });
      return { message: 'Payout released to seller', orderId };
    });
  }

  // ─── ADMIN view filter ─────────────────────────────────────────────────────

  private resolveAdminViewFilter(view?: string): Record<string, any> {
    switch (view) {
      case 'cancel_requests':
        return { internalNote: { startsWith: 'CANCEL_REQUESTED:' } };
      case 'disputes':
        return { status: OrderStatus.disputed };
      case 'processing':
        return { status: { in: [OrderStatus.paid, OrderStatus.processing] } };
      case 'shipped':
        return {
          status: { in: [OrderStatus.shipped, OrderStatus.in_transit] },
        };
      case 'delivered':
        return { status: OrderStatus.delivered };
      case 'cancelled':
        return { status: OrderStatus.cancelled };
      case 'refunded':
        return { status: OrderStatus.refunded };
      case 'pending_payouts':
        return {
          status: OrderStatus.paid,
          internalNote: { not: 'PAYOUT_RELEASED' },
          OR: [
            { stripeChargeId: { not: null } },
            { stripePaymentIntentId: { not: null } },
          ],
          seller: { stripeAccountId: { not: null } },
        };
      default:
        return {};
    }
  }
}
