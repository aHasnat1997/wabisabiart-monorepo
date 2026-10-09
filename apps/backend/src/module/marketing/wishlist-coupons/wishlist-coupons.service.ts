/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/require-await */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@wabisabiart/db';
import { UpdateWishlistConfigDto } from './dto/update-config.dto.js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import { nanoid } from 'nanoid';

@Injectable()
export class WishlistCouponsService {
  private readonly logger = new Logger(WishlistCouponsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private get db(): any {
    return this.prisma as any;
  }

  async getConfig(sellerId: string) {
    return this.db.wishlistAutoCouponConfig.upsert({
      where: { sellerId },
      create: {
        sellerId,
        isEnabled: false,
        discountPercentage: 5,
        validityDays: 30,
        sendEmailNotification: true,
        autoApplyAtCheckout: true,
      },
      update: {},
    });
  }

  async updateConfig(sellerId: string, dto: UpdateWishlistConfigDto) {
    await this.getConfig(sellerId);

    return this.db.wishlistAutoCouponConfig.update({
      where: { sellerId },
      data: {
        ...(dto.discountPercentage !== undefined
          ? { discountPercentage: dto.discountPercentage }
          : {}),
        ...(dto.validityDays !== undefined
          ? { validityDays: dto.validityDays }
          : {}),
        ...(dto.sendEmailNotification !== undefined
          ? { sendEmailNotification: dto.sendEmailNotification }
          : {}),
        ...(dto.autoApplyAtCheckout !== undefined
          ? { autoApplyAtCheckout: dto.autoApplyAtCheckout }
          : {}),
        ...(dto.isEnabled !== undefined ? { isEnabled: dto.isEnabled } : {}),
      },
    });
  }

  async toggleEnabled(sellerId: string) {
    const config = await this.getConfig(sellerId);

    return this.db.wishlistAutoCouponConfig.update({
      where: { sellerId },
      data: { isEnabled: !config.isEnabled },
    });
  }

  async getStats(sellerId: string) {
    const [wishlistedItems, couponsGenerated, couponsRedeemed, redeemedRows] =
      await Promise.all([
        this.db.wishlistCouponLog.count({ where: { sellerId } }),
        this.db.wishlistCouponLog.count({
          where: { sellerId, status: { in: ['GENERATED', 'REDEEMED'] as any } },
        }),
        this.db.wishlistCouponLog.count({
          where: { sellerId, status: 'REDEEMED' as any },
        }),
        this.db.wishlistCouponLog.findMany({
          where: { sellerId, status: 'REDEEMED' as any },
          select: { discountAmount: true },
        }),
      ]);

    const revenueGenerated = redeemedRows.reduce(
      (sum, row) => sum + Number(row.discountAmount || 0),
      0,
    );

    const generationRate =
      wishlistedItems === 0
        ? '0%'
        : `${Math.round((couponsGenerated / wishlistedItems) * 100)}%`;

    const redemptionRate =
      couponsGenerated === 0
        ? '0%'
        : `${Math.round((couponsRedeemed / couponsGenerated) * 100)}%`;

    return {
      wishlistedItems,
      couponsGenerated,
      couponsRedeemed,
      revenueGenerated,
      generationRate,
      redemptionRate,
    };
  }

  async getRecentActivity(sellerId: string, limit = 20) {
    const logs = await this.db.wishlistCouponLog.findMany({
      where: { sellerId },
      orderBy: { generatedAt: 'desc' },
      take: limit,
    });

    const customerIds = [
      ...new Set(logs.map((log: any) => String(log.customerId))),
    ] as string[];
    const customers = await this.prisma.user.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, fullName: true },
    });

    const customerMap = new Map(customers.map((c) => [c.id, c.fullName]));

    return logs.map((log) => ({
      ...log,
      customerName: customerMap.get(log.customerId) ?? 'Unknown customer',
    }));
  }

  async onProductWishlisted(
    sellerId: string,
    customerId: string,
    productId: string,
    productName: string,
  ) {
    try {
      const config = await this.getConfig(sellerId);
      if (!config.isEnabled) {
        return null;
      }

      const now = new Date();
      const existing = await this.db.wishlistCouponLog.findFirst({
        where: {
          sellerId,
          customerId,
          productId,
          status: 'GENERATED' as any,
          expiresAt: { gt: now },
        },
      });

      if (existing) {
        return null;
      }

      const couponCode = `WISH-${nanoid(8).toUpperCase()}`;
      const expiresAt = new Date(
        now.getTime() + Number(config.validityDays) * 24 * 60 * 60 * 1000,
      );

      await this.db.wishlistCouponLog.create({
        data: {
          sellerId,
          customerId,
          productId,
          productName,
          couponCode,
          status: 'GENERATED' as any,
          expiresAt,
        },
      });

      await this.db.coupon.create({
        data: {
          sellerId,
          code: couponCode,
          discountType: 'PERCENTAGE' as any,
          type: 'percentage',
          discountValue: Number(config.discountPercentage),
          maximumUses: 1,
          usageCount: 0,
          minimumPurchaseAmount: 0,
          customerRestriction: 'ALL_CUSTOMERS' as any,
          expirationDate: expiresAt,
          startsAt: now,
          expiresAt,
          isActive: true,
        },
      });

      if (config.sendEmailNotification) {
        this.eventEmitter.emit('wishlist.coupon.generated', {
          customerId,
          couponCode,
          productName,
          expiresAt,
          discountPercentage: Number(config.discountPercentage),
        });
      }

      return { couponCode, expiresAt };
    } catch (error) {
      this.logger.warn(
        `Wishlist coupon generation failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      return null;
    }
  }

  async onCouponRedeemed(
    couponCode: string,
    sellerId: string,
    discountAmount: number,
    db: any = this.prisma as any,
  ) {
    try {
      await db.wishlistCouponLog.updateMany({
        where: {
          sellerId,
          couponCode,
          status: 'GENERATED' as any,
        },
        data: {
          status: 'REDEEMED' as any,
          redeemedAt: new Date(),
          discountAmount,
        },
      });

      return { success: true };
    } catch (error) {
      this.logger.warn(
        `Wishlist coupon redeem update failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      return { success: false };
    }
  }

  @Cron('0 2 * * *')
  async expireOldCoupons() {
    try {
      const now = new Date();

      const expiring = await this.db.wishlistCouponLog.findMany({
        where: {
          status: 'GENERATED' as any,
          expiresAt: { lt: now },
        },
        select: { couponCode: true },
      });

      if (!expiring.length) {
        return;
      }

      const codes = expiring.map((row) => row.couponCode);

      await this.db.wishlistCouponLog.updateMany({
        where: {
          status: 'GENERATED' as any,
          expiresAt: { lt: now },
        },
        data: {
          status: 'EXPIRED' as any,
        },
      });

      await this.db.coupon.updateMany({
        where: {
          code: { in: codes },
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
    } catch (error) {
      this.logger.warn(
        `Expire wishlist coupons job failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }
}
