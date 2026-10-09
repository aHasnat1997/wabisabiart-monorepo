/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@wabisabiart/db';
import { CreateCouponDto } from './dto/create-coupon.dto.js';
import { UpdateCouponDto } from './dto/update-coupon.dto.js';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(sellerId: string, dto: CreateCouponDto) {
    const normalizedCode = dto.code.trim().toUpperCase();

    if (!/^[A-Z0-9]+$/.test(normalizedCode)) {
      throw new ConflictException(
        'Coupon code must be uppercase letters and numbers only, no spaces',
      );
    }

    const existsForSeller = await this.prisma.coupon.findFirst({
      where: { sellerId, code: normalizedCode },
    });

    if (existsForSeller) {
      throw new ConflictException('Coupon code already exists for this seller');
    }

    try {
      return await this.prisma.coupon.create({
        data: {
          sellerId,
          code: normalizedCode,
          discountType: (dto.discountType ?? 'PERCENTAGE') as any,
          discountValue: dto.discountValue,
          maximumUses: dto.maximumUses ?? 100,
          maximumDiscount: dto.maximumDiscount ?? null,
          usageCount: 0,
          minimumPurchaseAmount: dto.minimumPurchase ?? 0,
          usageLimitPerUser: dto.usageLimitPerUser ?? null,
          customerRestriction: (dto.customerRestriction ??
            'ALL_CUSTOMERS') as any,
          startsAt: dto.startsAt ? new Date(dto.startsAt) : new Date(),
          expiresAt: new Date(dto.expiresAt),
          isActive: dto.isActive ?? true,
        },
      });
    } catch {
      throw new ConflictException('Coupon code already exists');
    }
  }

  async findAll(sellerId: string) {
    const rows = await this.prisma.coupon.findMany({
      where: { sellerId },
      include: {
        _count: { select: { usageLogs: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return rows.map((row) => ({
      ...row,
      redemptionsDisplay: `${row.usageCount} / ${row.maximumUses}`,
    }));
  }

  async findOne(id: string, sellerId: string) {
    const coupon = await this.prisma.coupon.findFirst({
      where: { id, sellerId },
      include: {
        _count: { select: { usageLogs: true } },
      },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return {
      ...coupon,
      redemptionsDisplay: `${coupon.usageCount} / ${coupon.maximumUses}`,
    };
  }

  async update(id: string, sellerId: string, dto: UpdateCouponDto) {
    await this.findOne(id, sellerId);

    return this.prisma.coupon.update({
      where: { id },
      data: {
        ...(dto.discountType !== undefined
          ? { discountType: dto.discountType as any }
          : {}),
        ...(dto.discountValue !== undefined
          ? { discountValue: dto.discountValue }
          : {}),
        ...(dto.maximumUses !== undefined
          ? { maximumUses: dto.maximumUses }
          : {}),
        ...(dto.maximumDiscount !== undefined
          ? { maximumDiscount: dto.maximumDiscount }
          : {}),
        ...(dto.expiresAt !== undefined
          ? {
              expiresAt: dto.expiresAt
                ? new Date(dto.expiresAt)
                : new Date('2099-12-31T23:59:59.000Z'),
            }
          : {}),
        ...(dto.startsAt !== undefined
          ? { startsAt: new Date(dto.startsAt) }
          : {}),
        ...(dto.minimumPurchase !== undefined
          ? { minimumPurchaseAmount: dto.minimumPurchase }
          : {}),
        ...(dto.usageLimitPerUser !== undefined
          ? { usageLimitPerUser: dto.usageLimitPerUser }
          : {}),
        ...(dto.customerRestriction !== undefined
          ? { customerRestriction: dto.customerRestriction as any }
          : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  async toggleActive(id: string, sellerId: string) {
    const coupon = await this.findOne(id, sellerId);

    return this.prisma.coupon.update({
      where: { id },
      data: { isActive: !coupon.isActive },
    });
  }

  async remove(id: string, sellerId: string) {
    await this.findOne(id, sellerId);
    await this.prisma.coupon.delete({ where: { id } });
    return { success: true };
  }

  generateCode() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';

    for (let i = 0; i < 8; i += 1) {
      code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }

    return code;
  }

  // ── Preview coupon (read-only, no DB writes) ──────────────────────────────
  // Reads the customer's cart from DB, groups items by seller, auto-calculates
  // each seller's subtotal. Finds which seller in the cart owns the coupon code.
  // Customer only sends { code } — no sellerId or cartTotal needed.
  async previewCoupon(
    code: string,
    customerId: string,
  ): Promise<
    | {
        valid: true;
        code: string;
        discountType: string;
        discountValue: number;
        discount: number;
        freeShipping: boolean;
        appliedToSeller: {
          sellerId: string;
          shopName: string;
          productIds: string[];
        };
        sellerCartTotal: number;
        finalSellerTotal: number;
        otherSellers: {
          sellerId: string;
          shopName: string;
          cartTotal: number;
        }[];
      }
    | { valid: false; reason: string }
  > {
    // Load customer cart with all items, products, and seller info
    const cart = await this.prisma.cart.findFirst({
      where: { userId: customerId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                price: true,
                discountType: true,
                discountValue: true,
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

    if (!cart || cart.items.length === 0)
      return { valid: false, reason: 'Your cart is empty' };

    // Group items by sellerProfileId and calculate subtotal per seller
    const sellerMap = new Map<
      string,
      { shopName: string; subtotal: number; productIds: string[] }
    >();

    for (const item of cart.items) {
      const sp = item.product.seller.sellerProfile;
      if (!sp) continue;

      const price = Number(
        (item.variant as any)?.price ?? item.product.price ?? 0,
      );
      const qty = item.quantity;
      let lineTotal = price * qty;

      // Apply product-level discount
      const dv = Number(item.product.discountValue || 0);
      if (item.product.discountType === 'fixed_amount') lineTotal -= dv * qty;
      else if (item.product.discountType === 'percentage')
        lineTotal -= (price * qty * dv) / 100;

      const existing = sellerMap.get(sp.id);
      if (existing) {
        existing.subtotal += Math.max(0, lineTotal);
        if (!existing.productIds.includes(item.product.id))
          existing.productIds.push(item.product.id);
      } else {
        sellerMap.set(sp.id, {
          shopName: sp.shopName,
          subtotal: Math.max(0, lineTotal),
          productIds: [item.product.id],
        });
      }
    }

    // Find which seller in the cart owns this coupon code
    const normalizedCode = code.trim().toUpperCase();
    const coupon = await this.prisma.coupon.findFirst({
      where: {
        code: normalizedCode,
        sellerId: { in: Array.from(sellerMap.keys()) },
      },
    });

    if (!coupon) {
      // Check if coupon exists at all but belongs to a seller not in cart
      const couponExists = await this.prisma.coupon.findFirst({
        where: { code: normalizedCode },
      });
      return {
        valid: false,
        reason: couponExists
          ? 'This coupon is not valid for any seller in your cart'
          : 'Coupon not found',
      };
    }

    if (!coupon.isActive) return { valid: false, reason: 'Coupon is inactive' };

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now)
      return { valid: false, reason: 'Coupon is not yet active' };
    if (coupon.expiresAt && coupon.expiresAt < now)
      return { valid: false, reason: 'Coupon has expired' };
    if (coupon.usageCount >= coupon.maximumUses)
      return { valid: false, reason: 'Coupon usage limit reached' };

    const sellerEntry = sellerMap.get(coupon.sellerId)!;
    const cartTotal = sellerEntry.subtotal;

    if (cartTotal < Number(coupon.minimumPurchaseAmount || 0))
      return {
        valid: false,
        reason: `Minimum purchase of $${Number(coupon.minimumPurchaseAmount || 0)} required for ${sellerEntry.shopName}`,
      };

    if (coupon.usageLimitPerUser) {
      const userUsageCount = await this.prisma.couponUsageLog.count({
        where: { couponId: coupon.id, customerId },
      });
      if (userUsageCount >= coupon.usageLimitPerUser)
        return { valid: false, reason: 'You have already used this coupon' };
    }

    if (coupon.customerRestriction === 'NEW_CUSTOMERS') {
      const previousOrderCount = await (this.prisma as any).order.count({
        where: { buyerId: customerId },
      });
      if (previousOrderCount > 0)
        return { valid: false, reason: 'Coupon is only for new customers' };
    }

    if ((coupon.customerRestriction as any) === 'VIP_ONLY') {
      const user = await this.prisma.user.findUnique({
        where: { id: customerId },
        select: { isVip: true },
      });
      if (!(user as any)?.isVip)
        return { valid: false, reason: 'Coupon is only for VIP customers' };
    }

    // Calculate discount
    let discount = 0;
    let freeShipping = false;
    const discountValue = Number(coupon.discountValue || 0);

    if (coupon.discountType === 'PERCENTAGE') {
      discount = (cartTotal * discountValue) / 100;
      if (coupon.maximumDiscount)
        discount = Math.min(discount, Number(coupon.maximumDiscount));
    } else if (coupon.discountType === 'FIXED') {
      discount = Math.min(discountValue, cartTotal);
    } else if (coupon.discountType === 'FREE_SHIPPING') {
      freeShipping = true;
    }

    // Other sellers in cart — coupon does not apply to them
    const otherSellers = Array.from(sellerMap.entries())
      .filter(([id]) => id !== coupon.sellerId)
      .map(([id, s]) => ({
        sellerId: id,
        shopName: s.shopName,
        cartTotal: s.subtotal,
      }));

    return {
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue,
      discount,
      freeShipping,
      appliedToSeller: {
        sellerId: coupon.sellerId,
        shopName: sellerEntry.shopName,
        productIds: sellerEntry.productIds,
      },
      sellerCartTotal: cartTotal,
      finalSellerTotal: Math.max(0, cartTotal - discount),
      otherSellers,
    };
  }

  // ── validateAndApply (called inside checkout transaction) ─────────────────
  async validateAndApply(
    code: string,
    sellerId: string,
    orderId: string,
    customerId: string,
    orderTotal: number,
    db: any = this.prisma as any,
  ): Promise<
    | { valid: true; discount: number; freeShipping: boolean; coupon: any }
    | { valid: false; reason: string }
  > {
    try {
      const coupon = await db.coupon.findFirst({
        where: { code: code.trim().toUpperCase(), sellerId },
      });

      if (!coupon) return { valid: false, reason: 'Coupon not found' };
      if (!coupon.isActive)
        return { valid: false, reason: 'Coupon is inactive' };

      const now = new Date();
      if (coupon.startsAt && coupon.startsAt > now)
        return { valid: false, reason: 'Coupon is not yet active' };
      if (coupon.expiresAt && coupon.expiresAt < now)
        return { valid: false, reason: 'Coupon has expired' };
      if (coupon.usageCount >= coupon.maximumUses)
        return { valid: false, reason: 'Coupon usage limit reached' };
      if (orderTotal < Number(coupon.minimumPurchaseAmount || 0))
        return { valid: false, reason: 'Minimum purchase not met' };

      if (coupon.usageLimitPerUser) {
        const userUsageCount = await db.couponUsageLog.count({
          where: { couponId: coupon.id, customerId },
        });
        if (userUsageCount >= coupon.usageLimitPerUser)
          return { valid: false, reason: 'You have already used this coupon' };
      }

      if (coupon.customerRestriction === 'NEW_CUSTOMERS') {
        const previousOrderCount = await db.order.count({
          where: { buyerId: customerId },
        });
        if (previousOrderCount > 0)
          return { valid: false, reason: 'Coupon is only for new customers' };
      }

      if (coupon.customerRestriction === 'VIP_ONLY') {
        const user = await db.user.findUnique({
          where: { id: customerId },
          select: { isVip: true },
        });
        if (!user?.isVip)
          return { valid: false, reason: 'Coupon is only for VIP customers' };
      }

      let discount = 0;
      let freeShipping = false;
      const discountValue = Number(coupon.discountValue || 0);

      if (coupon.discountType === 'PERCENTAGE') {
        discount = (orderTotal * discountValue) / 100;
        if (coupon.maximumDiscount)
          discount = Math.min(discount, Number(coupon.maximumDiscount));
      } else if (coupon.discountType === 'FIXED') {
        discount = Math.min(discountValue, orderTotal);
      } else if (coupon.discountType === 'FREE_SHIPPING') {
        freeShipping = true;
        discount = 0;
      }

      await db.couponUsageLog.create({
        data: {
          couponId: coupon.id,
          orderId,
          customerId,
          discountAmount: discount,
        },
      });

      await db.coupon.update({
        where: { id: coupon.id },
        data: { usageCount: { increment: 1 } },
      });

      return { valid: true, discount, freeShipping, coupon };
    } catch {
      return { valid: false, reason: 'Coupon validation failed safely' };
    }
  }

  async getDashboardStats(sellerId: string) {
    const [activeCoupons, totalRedemptions] = await Promise.all([
      this.prisma.coupon.count({ where: { sellerId, isActive: true } }),
      this.prisma.couponUsageLog.count({
        where: { coupon: { sellerId } },
      }),
    ]);

    return { activeCoupons, totalRedemptions };
  }
}
