/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@wabisabiart/db';

interface OrderItemInput {
  productId: string;
  category?: string;
  quantity: number;
  price: any;
}

@Injectable()
export class DiscountEngineService {
  private readonly logger = new Logger(DiscountEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  async applyBestPromotion(
    sellerId: string,
    orderItems: OrderItemInput[],
    customerId: string,
  ): Promise<{ discount: number; appliedPromotion: any | null }> {
    try {
      const now = new Date();
      const db = this.prisma as any;

      const promotions = await db.promotion.findMany({
        where: {
          sellerId,
          isActive: true,
          startDate: { lte: now },
          OR: [{ endDate: null }, { endDate: { gte: now } }],
        },
      });

      if (!promotions.length) {
        return { discount: 0, appliedPromotion: null };
      }

      let bestDiscount = 0;
      let appliedPromotion: any | null = null;

      for (const promotion of promotions) {
        if (
          promotion.usageLimit !== null &&
          promotion.usageCount >= promotion.usageLimit
        ) {
          continue;
        }

        const applicableItems = this.getScopedItems(orderItems, promotion);
        if (!applicableItems.length) {
          continue;
        }

        const scopedTotal = applicableItems.reduce(
          (sum, item) => sum + Number(item.price) * item.quantity,
          0,
        );

        if (scopedTotal < Number(promotion.minimumPurchase || 0)) {
          continue;
        }

        let discount = 0;
        const value = Number(promotion.discountValue || 0);

        if (promotion.discountType === 'PERCENTAGE') {
          discount = (scopedTotal * value) / 100;
        } else if (promotion.discountType === 'FIXED') {
          discount = Math.min(value, scopedTotal);
        } else if (promotion.discountType === 'BOGO') {
          discount = scopedTotal * 0.5;
        }

        if (discount > bestDiscount) {
          bestDiscount = discount;
          appliedPromotion = promotion;
        }
      }

      return {
        discount: Math.max(0, bestDiscount),
        appliedPromotion,
      };
    } catch (error) {
      this.logger.warn(
        `Promotion engine failed for seller ${sellerId}, customer ${customerId}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      return { discount: 0, appliedPromotion: null };
    }
  }

  private getScopedItems(orderItems: OrderItemInput[], promotion: any) {
    if (promotion.applyTo === 'ALL_PRODUCTS') {
      return orderItems;
    }

    if (promotion.applyTo === 'SPECIFIC_PRODUCTS') {
      return orderItems.filter((item) =>
        (promotion.productIds || []).includes(item.productId),
      );
    }

    if (promotion.applyTo === 'BY_CATEGORY') {
      return orderItems.filter(
        (item) =>
          item.category && (promotion.categories || []).includes(item.category),
      );
    }

    return [];
  }
}
