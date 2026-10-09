/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@wabisabiart/db';
import { CreatePromotionDto } from './dto/create-promotion.dto.js';
import { UpdatePromotionDto } from './dto/update-promotion.dto.js';

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(seller: Record<string, any>, dto: CreatePromotionDto) {
    const startDate = new Date(dto.startDate);
    const endDate = dto.endDate ? new Date(dto.endDate) : null;

    if (endDate && endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    if (
      dto.applyTo === 'BY_CATEGORY' &&
      (!dto.categoryIds || dto.categoryIds.length === 0)
    ) {
      throw new BadRequestException(
        'Category IDs are required when applyTo is BY_CATEGORY',
      );
    }

    if (
      dto.applyTo === 'SPECIFIC_PRODUCTS' &&
      (!dto.productIds || dto.productIds.length === 0)
    ) {
      throw new BadRequestException(
        'Product IDs are required when applyTo is SPECIFIC_PRODUCTS',
      );
    }

    if (dto.usageLimit && dto.usageLimit < 1) {
      throw new BadRequestException('Usage limit must be at least 1');
    }

    if (dto.discountType === 'BOGO' && dto.discountValue !== 1) {
      throw new BadRequestException(
        'By One Get One discount value must be 1 (buy 1 get 1)',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const promotion = await tx.promotion.create({
        data: {
          sellerId: seller.sellerProfile.id,
          name: dto.name,
          discountType: dto.discountType,
          discountValue: dto.discountValue,
          applyTo: dto.applyTo,
          startDate,
          endDate,
          minimumPurchase: dto.minimumPurchase ?? 0,
          usageLimit: dto.usageLimit ?? null,
          onePerCustomer: dto.onePerCustomer ?? false,
        },
      });

      if (dto.applyTo === 'BY_CATEGORY' && dto.categoryIds) {
        await tx.category.updateMany({
          where: { id: { in: dto.categoryIds } },
          data: {
            promotionId: promotion.id,
          },
        });
      }

      if (dto.applyTo === 'SPECIFIC_PRODUCTS' && dto.productIds) {
        await tx.product.updateMany({
          where: { id: { in: dto.productIds }, sellerId: seller.id },
          data: {
            promotionId: promotion.id,
          },
        });
      }

      return promotion;
    });

    return result;
  }

  async findAll(sellerId: string, filter?: 'active' | 'inactive') {
    return this.prisma.promotion.findMany({
      where: {
        sellerId,
        ...(filter === 'active' ? { isActive: true } : {}),
        ...(filter === 'inactive' ? { isActive: false } : {}),
      },
      include: {
        _count: {
          select: { usageLogs: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, sellerId: string) {
    const promotion = await this.prisma.promotion.findFirst({
      where: { id, sellerId },
      include: {
        categories: true,
        products: true,
      },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    return promotion;
  }

  async update(id: string, sellerId: string, dto: UpdatePromotionDto) {
    const result = await this.prisma.promotion.update({
      where: { id, sellerId },
      data: dto,
    });

    return result;
  }

  async toggleActive(id: string, sellerId: string) {
    const promotion = await this.findOne(id, sellerId);

    return this.prisma.promotion.update({
      where: { id },
      data: { isActive: !promotion.isActive },
    });
  }

  async remove(id: string, sellerId: string) {
    await this.findOne(id, sellerId);
    await this.prisma.promotion.delete({ where: { id } });
    return { success: true };
  }

  async getOverviewStats(sellerId: string) {
    const [activePromotions, usageLogs] = await Promise.all([
      this.prisma.promotion.count({ where: { sellerId, isActive: true } }),
      this.prisma.promotionUsageLog.findMany({
        where: { promotion: { sellerId } },
        select: { discountAmount: true },
      }),
    ]);

    const totalDiscountsGiven = usageLogs.reduce(
      (sum, log) => sum + Number(log.discountAmount || 0),
      0,
    );

    return {
      activePromotions,
      totalDiscountsGiven,
      couponRedemptions: 0,
      freeShippingOrders: 0,
    };
  }
}
