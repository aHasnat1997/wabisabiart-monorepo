import { Injectable } from '@nestjs/common';
import { PrismaService } from '@wabisabiart/db';
import { CreateRuleDto } from './dto/create-rule.dto.js';
import { UpdateRuleDto } from './dto/update-rule.dto.js';
import { UpdateGlobalConfigDto } from './dto/update-global-config.dto.js';

@Injectable()
export class FreeShippingService {
  constructor(private readonly prisma: PrismaService) {}

  async getGlobalConfig(sellerId: string) {
    return this.prisma.globalFreeShippingConfig.upsert({
      where: { sellerId },
      create: {
        sellerId,
        isEnabled: false,
        minimumOrderAmount: 0,
      },
      update: {},
    });
  }

  async updateGlobalConfig(sellerId: string, dto: UpdateGlobalConfigDto) {
    await this.getGlobalConfig(sellerId);

    return this.prisma.globalFreeShippingConfig.update({
      where: { sellerId },
      data: {
        ...(dto.minimumOrderAmount !== undefined
          ? { minimumOrderAmount: dto.minimumOrderAmount }
          : {}),
        ...(dto.isEnabled !== undefined ? { isEnabled: dto.isEnabled } : {}),
      },
    });
  }

  async toggleGlobalConfig(sellerId: string) {
    const config = await this.getGlobalConfig(sellerId);

    return this.prisma.globalFreeShippingConfig.update({
      where: { sellerId },
      data: { isEnabled: !config.isEnabled },
    });
  }

  async getAllRules(sellerId: string) {
    return this.prisma.freeShippingRule.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createRule(sellerId: string, dto: CreateRuleDto) {
    return this.prisma.freeShippingRule.create({
      data: {
        sellerId,
        name: dto.name,
        minimumOrderAmount: dto.minimumOrderAmount,
        region: dto.region,
      },
    });
  }

  async updateRule(id: string, sellerId: string, dto: UpdateRuleDto) {
    return this.prisma.freeShippingRule.updateMany({
      where: { id, sellerId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.minimumOrderAmount !== undefined
          ? { minimumOrderAmount: dto.minimumOrderAmount }
          : {}),
        ...(dto.region !== undefined ? { region: dto.region } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  async toggleRule(id: string, sellerId: string) {
    const rule = await this.prisma.freeShippingRule.findFirst({
      where: { id, sellerId },
    });

    if (!rule) {
      return { count: 0 };
    }

    return this.prisma.freeShippingRule.updateMany({
      where: { id, sellerId },
      data: { isActive: !rule.isActive },
    });
  }

  async removeRule(id: string, sellerId: string) {
    await this.prisma.freeShippingRule.deleteMany({ where: { id, sellerId } });
    return { success: true };
  }

  async getDashboardStats(sellerId: string) {
    const [activeRules, rules, config] = await Promise.all([
      this.prisma.freeShippingRule.count({
        where: { sellerId, isActive: true },
      }),
      this.prisma.freeShippingRule.findMany({
        where: { sellerId },
        select: { orderCount: true },
      }),
      this.getGlobalConfig(sellerId),
    ]);

    const rulesCount = rules.reduce((sum, r) => sum + r.orderCount, 0);

    return {
      activeRules,
      totalFreeShippingOrders: rulesCount + (config.triggerCount ?? 0),
    };
  }

  async checkFreeShipping(
    sellerId: string,
    orderTotal: number,
    customerRegion: string,
  ): Promise<
    | { freeShipping: true; reason: 'global' }
    | { freeShipping: true; reason: 'rule'; ruleName: string }
    | { freeShipping: false }
  > {
    try {
      const config = await this.getGlobalConfig(sellerId);

      if (
        config.isEnabled &&
        orderTotal >= Number(config.minimumOrderAmount || 0)
      ) {
        return { freeShipping: true, reason: 'global' };
      }

      const rules = await this.prisma.freeShippingRule.findMany({
        where: {
          sellerId,
          isActive: true,
          minimumOrderAmount: {
            lte: orderTotal,
          },
          OR: [{ region: 'All Countries' }, { region: customerRegion }],
        },
        orderBy: { minimumOrderAmount: 'desc' },
      });

      if (rules.length > 0) {
        return {
          freeShipping: true,
          reason: 'rule',
          ruleName: rules[0].name,
        };
      }

      return { freeShipping: false };
    } catch {
      return { freeShipping: false };
    }
  }
}
