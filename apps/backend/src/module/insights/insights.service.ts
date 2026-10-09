import { Injectable } from '@nestjs/common';
import { PrismaService } from '@wabisabiart/db';
import {
  SalesIncomeResponse,
  TopProductResponse,
  WishlistAnalyticsResponse,
  CategoryBreakdownResponse,
  CustomersByRegionResponse,
} from './dto/insights.dto.js';

@Injectable()
export class InsightsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Parse date range or use presets
   */
  private getDateRange(range?: '7' | '30' | '90' | '365'): {
    startDate: Date;
    endDate: Date;
  } {
    const endDate = new Date();
    const startDate = new Date();

    switch (range) {
      case '7':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '365':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30); // default to 30 days
    }

    return { startDate, endDate };
  }

  /**
   * Format currency for responses
   */
  private formatCurrency(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toFixed(2);
  }

  /**
   * Format percentage for responses
   */
  private formatPercentage(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${num.toFixed(2)}%`;
  }

  /**
   * Calculate percentage growth between two periods
   */
  private calculateGrowth(current: number, previous: number): string {
    if (previous === 0) return '0%';
    const growth = ((current - previous) / previous) * 100;
    return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SALES & INCOME ANALYTICS
  // ─────────────────────────────────────────────────────────────────────────

  async getSalesIncome(
    sellerId?: string | null,
    range: '7' | '30' | '90' | '365' = '30',
  ): Promise<SalesIncomeResponse> {
    const { startDate, endDate } = this.getDateRange(range);
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(
      prevStartDate.getDate() -
        Math.floor(
          (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24),
        ),
    );

    const whereClause = sellerId
      ? { sellerId, createdAt: { gte: startDate, lte: endDate } }
      : { createdAt: { gte: startDate, lte: endDate } };
    const prevWhereClause = sellerId
      ? { sellerId, createdAt: { gte: prevStartDate, lt: startDate } }
      : { createdAt: { gte: prevStartDate, lt: startDate } };

    // Current period data
    const currentOrders = await this.prisma.order.findMany({
      where: whereClause,
      select: {
        id: true,
        totalAmount: true,
        shippingCost: true,
        tipAmount: true,
        createdAt: true,
      },
    });

    const currentPeriod = {
      totalRevenue: currentOrders.reduce(
        (sum, o) => sum + Number(o.totalAmount),
        0,
      ),
      totalOrders: currentOrders.length,
    };

    // Previous period data for comparison
    const previousOrders = await this.prisma.order.findMany({
      where: prevWhereClause,
      select: {
        id: true,
        totalAmount: true,
      },
    });

    const previousPeriod = {
      totalRevenue: previousOrders.reduce(
        (sum, o) => sum + Number(o.totalAmount),
        0,
      ),
      totalOrders: previousOrders.length,
    };

    // Group daily data
    const dailyData = this.groupByDate(currentOrders, 'daily');

    // Revenue breakdown
    const revenueBreakdown = await this.getRevenueBreakdown(whereClause);

    return {
      totalRevenue: this.formatCurrency(currentPeriod.totalRevenue),
      totalOrders: currentPeriod.totalOrders,
      averageOrderValue: this.formatCurrency(
        currentPeriod.totalOrders > 0
          ? currentPeriod.totalRevenue / currentPeriod.totalOrders
          : 0,
      ),
      revenueGrowth: this.calculateGrowth(
        currentPeriod.totalRevenue,
        previousPeriod.totalRevenue,
      ),
      ordersGrowth: this.calculateGrowth(
        currentPeriod.totalOrders,
        previousPeriod.totalOrders,
      ),
      dailyData,
      revenueBreakdown,
    };
  }

  private async getRevenueBreakdown(
    whereClause: Record<string, unknown>,
  ): Promise<{ productSales: string; shippingFees: string; tips: string }> {
    const orders = await this.prisma.order.findMany({
      where: whereClause,
      select: {
        subtotal: true,
        shippingCost: true,
        tipAmount: true,
      },
    });

    return {
      productSales: this.formatCurrency(
        orders.reduce((sum, o) => sum + Number(o.subtotal), 0),
      ),
      shippingFees: this.formatCurrency(
        orders.reduce((sum, o) => sum + Number(o.shippingCost), 0),
      ),
      tips: this.formatCurrency(
        orders.reduce((sum, o) => sum + Number(o.tipAmount || 0), 0),
      ),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TOP PRODUCTS ANALYTICS
  // ─────────────────────────────────────────────────────────────────────────

  async getTopProducts(
    sellerId?: string | null,
    range: '7' | '30' | '90' | '365' = '30',
    limit: number = 10,
  ): Promise<TopProductResponse[]> {
    const { startDate, endDate } = this.getDateRange(range);

    const orderWhereClause = sellerId
      ? { sellerId, createdAt: { gte: startDate, lte: endDate } }
      : { createdAt: { gte: startDate, lte: endDate } };

    const orders = await this.prisma.order.findMany({
      where: orderWhereClause,
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                averageRating: true,
              },
            },
            variant: {
              select: {
                mediaUrl: true,
              },
            },
          },
        },
      },
    });

    // Aggregate product data
    const productMap = new Map<
      string,
      {
        id: string;
        title: string;
        imageUrl?: string;
        totalSold: number;
        totalRevenue: number;
        rating: number;
        reviewCount: number;
      }
    >();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.productId;
        if (!productMap.has(productId)) {
          productMap.set(productId, {
            id: productId,
            title: item.productTitle,
            imageUrl: item.imageUrl || item.variant?.mediaUrl || undefined,
            totalSold: 0,
            totalRevenue: 0,
            rating: Number(item.product.averageRating),
            reviewCount: 0,
          });
        }
        const existing = productMap.get(productId)!;
        existing.totalSold += item.quantity;
        existing.totalRevenue += Number(item.totalPrice);
      });
    });

    // Get review count for products
    const productIds = Array.from(productMap.keys());
    if (productIds.length > 0) {
      const reviewCounts = await this.prisma.review.groupBy({
        by: ['productId'],
        where: { productId: { in: productIds } },
        _count: true,
      });

      reviewCounts.forEach((rc) => {
        const product = productMap.get(rc.productId);
        if (product) {
          product.reviewCount = rc._count;
        }
      });
    }

    // Sort by revenue and limit
    const sorted = Array.from(productMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);

    return sorted.map((p) => ({
      id: p.id,
      title: p.title,
      imageUrl: p.imageUrl,
      totalSold: p.totalSold,
      totalRevenue: this.formatCurrency(p.totalRevenue),
      averageRating: p.rating.toString(),
      reviewCount: p.reviewCount,
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // WISHLIST ANALYTICS
  // ─────────────────────────────────────────────────────────────────────────

  async getWishlistAnalytics(
    sellerId?: string | null,
    range: '7' | '30' | '90' | '365' = '30',
  ): Promise<WishlistAnalyticsResponse> {
    const { startDate, endDate } = this.getDateRange(range);

    // Get all wishlist items in date range
    const wishlistItems = await this.prisma.wishlistItem.findMany({
      where: {
        addedAt: { gte: startDate, lte: endDate },
        product: sellerId ? { sellerId } : undefined,
      },
      include: {
        product: true,
        wishlist: {
          select: {
            userId: true,
          },
        },
      },
    });

    const totalWishlists = wishlistItems.length;

    // Find conversions (wishlist items that were purchased)
    // Map wishlist items by userId+productId and timestamp to avoid overcounting
    const wishlistMap = new Map<
      string,
      { userId: string; createdAt: Date; productId: string }[]
    >();
    wishlistItems.forEach((wi) => {
      const key = `${wi.wishlist.userId}_${wi.productId}`;
      if (!wishlistMap.has(key)) {
        wishlistMap.set(key, []);
      }
      wishlistMap.get(key)!.push({
        userId: wi.wishlist.userId,
        createdAt: wi.addedAt,
        productId: wi.productId,
      });
    });

    let wishlistConversions = 0;
    let conversionRevenue = 0;
    const conversionsByProduct = new Map<string, number>();
    const conversionsByDate = new Map<string, number>();

    if (wishlistMap.size > 0) {
      // Transform wishlistMap into array of {userId, productId, earliestDate} for batch query
      const pairs = Array.from(wishlistMap.entries()).map(([key, entries]) => {
        const [userId, productId] = key.split('_');
        const earliestWishlist = entries.reduce((min, curr) =>
          curr.createdAt < min.createdAt ? curr : min,
        );
        return { userId, productId, earliestDate: earliestWishlist.createdAt };
      });

      // Issue single query with OR conditions instead of N+1 queries
      const conversions = await this.prisma.orderItem.findMany({
        where: {
          OR: pairs.map((p) => ({
            productId: p.productId,
            order: {
              buyerId: p.userId,
              sellerId: sellerId || undefined,
              createdAt: { gte: p.earliestDate, lte: endDate },
            },
          })),
        },
        select: {
          productId: true,
          totalPrice: true,
          order: { select: { buyerId: true } },
        },
      });

      // Post-process results to count unique conversions per product and by date
      const processedConversions = new Set<string>();
      for (const conversion of conversions) {
        const key = `${conversion.order.buyerId}_${conversion.productId}`;
        if (!processedConversions.has(key)) {
          processedConversions.add(key);
          wishlistConversions += 1;
          conversionRevenue += Number(conversion.totalPrice || 0);
          conversionsByProduct.set(
            conversion.productId,
            (conversionsByProduct.get(conversion.productId) ?? 0) + 1,
          );

          // Find the pair to get earliestDate for conversionsByDate
          const pair = pairs.find(
            (p) =>
              p.userId === conversion.order.buyerId &&
              p.productId === conversion.productId,
          );
          if (pair) {
            const conversionDate = this.formatDate(pair.earliestDate, 'daily');
            conversionsByDate.set(
              conversionDate,
              (conversionsByDate.get(conversionDate) ?? 0) + 1,
            );
          }
        }
      }
    }

    // Daily data - aggregate wishlist adds and conversions by date
    const dailyData = this.groupWishlistByDate(
      wishlistItems,
      'daily',
      conversionsByDate,
    );

    // Top wishlisted products - filter out items with null titles
    const validWishlistItems = wishlistItems.filter(
      (item): item is typeof item & { product: { title: string } } =>
        item.product.title !== null && item.product.title !== undefined,
    );
    const topWishlisted = this.getTopWishlistedProducts(
      validWishlistItems,
      10,
      conversionsByProduct,
    );

    // Previous period for growth
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(
      prevStartDate.getDate() -
        Math.floor(
          (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24),
        ),
    );

    const previousWishlists = await this.prisma.wishlistItem.findMany({
      where: {
        addedAt: { gte: prevStartDate, lte: startDate },
        product: sellerId ? { sellerId } : undefined,
      },
    });

    return {
      totalWishlists,
      wishlistConversions,
      conversionRate: this.formatPercentage(
        totalWishlists > 0 ? (wishlistConversions / totalWishlists) * 100 : 0,
      ),
      wishlistGrowth: this.calculateGrowth(
        totalWishlists,
        previousWishlists.length,
      ),
      revenue: this.formatCurrency(conversionRevenue),
      dailyData,
      topWishlistedProducts: topWishlisted,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SALES BY CATEGORY
  // ─────────────────────────────────────────────────────────────────────────

  async getSalesByCategory(
    sellerId?: string | null,
    range: '7' | '30' | '90' | '365' = '30',
  ): Promise<CategoryBreakdownResponse[]> {
    const { startDate, endDate } = this.getDateRange(range);

    const orderWhereClause = sellerId
      ? { sellerId, createdAt: { gte: startDate, lte: endDate } }
      : { createdAt: { gte: startDate, lte: endDate } };

    const ordersByCategory = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: orderWhereClause,
      },
      _sum: {
        totalPrice: true,
        quantity: true,
      },
    });

    if (ordersByCategory.length === 0) {
      return [];
    }

    // Fetch product details to get category
    const productsData = await this.prisma.product.findMany({
      where: {
        id: { in: ordersByCategory.map((oi) => oi.productId) },
      },
      select: {
        id: true,
        categoryId: true,
        category: { select: { id: true, name: true } },
      },
    });

    // Create product to category map
    const productToCategoryMap = new Map(
      productsData.map((p) => [p.id, p.category]),
    );

    // Group by category
    const categoryMap = new Map<
      string,
      {
        categoryId: string;
        categoryName: string;
        totalRevenue: number;
        totalSales: number;
      }
    >();

    ordersByCategory.forEach((oi) => {
      const category = productToCategoryMap.get(oi.productId);
      if (category) {
        const key = category.id;
        if (!categoryMap.has(key)) {
          categoryMap.set(key, {
            categoryId: category.id,
            categoryName: category.name,
            totalRevenue: 0,
            totalSales: 0,
          });
        }
        const existing = categoryMap.get(key)!;
        existing.totalRevenue += Number(oi._sum.totalPrice || 0);
        existing.totalSales += oi._sum.quantity || 0;
      }
    });

    const totalRevenue = Array.from(categoryMap.values()).reduce(
      (sum, c) => sum + c.totalRevenue,
      0,
    );

    // Get previous period data for growth
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(
      prevStartDate.getDate() -
        Math.floor(
          (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24),
        ),
    );

    const prevOrdersByCategory = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: sellerId
          ? { sellerId, createdAt: { gte: prevStartDate, lte: startDate } }
          : { createdAt: { gte: prevStartDate, lte: startDate } },
      },
      _sum: {
        totalPrice: true,
      },
    });

    const prevProductToCategoryMap = new Map(
      productsData.map((p) => [p.id, p.category]),
    );
    const prevCategoryMap = new Map<string, number>();

    prevOrdersByCategory.forEach((oi) => {
      const category = prevProductToCategoryMap.get(oi.productId);
      if (category) {
        const key = category.id;
        prevCategoryMap.set(
          key,
          (prevCategoryMap.get(key) || 0) + Number(oi._sum.totalPrice || 0),
        );
      }
    });

    return Array.from(categoryMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .map((c) => ({
        categoryName: c.categoryName,
        categoryId: c.categoryId,
        totalRevenue: this.formatCurrency(c.totalRevenue),
        totalSales: c.totalSales,
        percentage: this.formatCurrency(
          totalRevenue > 0 ? (c.totalRevenue / totalRevenue) * 100 : 0,
        ),
        trend: this.calculateGrowth(
          c.totalRevenue,
          prevCategoryMap.get(c.categoryId) || 0,
        ),
      }));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CUSTOMERS BY REGION
  // ─────────────────────────────────────────────────────────────────────────

  async getCustomersByRegion(
    sellerId?: string | null,
    range: '7' | '30' | '90' | '365' = '30',
  ): Promise<CustomersByRegionResponse[]> {
    const { startDate, endDate } = this.getDateRange(range);

    const orderWhereClause = sellerId
      ? { sellerId, createdAt: { gte: startDate, lte: endDate } }
      : { createdAt: { gte: startDate, lte: endDate } };

    const orders = await this.prisma.order.findMany({
      where: orderWhereClause,
      include: {
        shippingAddress: {
          select: {
            country: true,
            stateProvince: true,
          },
        },
      },
    });

    // Group by region (country/state)
    const regionMap = new Map<
      string,
      {
        region: string;
        country?: string;
        customerCount: Set<string>; // unique buyer IDs
        totalRevenue: number;
        orderCount: number;
      }
    >();

    orders.forEach((order) => {
      const country = order.shippingAddress?.country || 'Unknown';
      const state = order.shippingAddress?.stateProvince || '';
      const region = state ? `${state}, ${country}` : country;

      if (!regionMap.has(region)) {
        regionMap.set(region, {
          region,
          country,
          customerCount: new Set(),
          totalRevenue: 0,
          orderCount: 0,
        });
      }

      const existing = regionMap.get(region)!;
      existing.customerCount.add(order.buyerId);
      existing.totalRevenue += Number(order.totalAmount);
      existing.orderCount += 1;
    });

    const totalRevenue = Array.from(regionMap.values()).reduce(
      (sum, r) => sum + r.totalRevenue,
      0,
    );

    // Get previous period for growth
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(
      prevStartDate.getDate() -
        Math.floor(
          (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24),
        ),
    );

    const prevOrders = await this.prisma.order.findMany({
      where: sellerId
        ? { sellerId, createdAt: { gte: prevStartDate, lte: startDate } }
        : { createdAt: { gte: prevStartDate, lte: startDate } },
      include: {
        shippingAddress: {
          select: {
            country: true,
            stateProvince: true,
          },
        },
      },
    });

    const prevRegionMap = new Map<string, number>();
    prevOrders.forEach((order) => {
      const country = order.shippingAddress?.country || 'Unknown';
      const state = order.shippingAddress?.stateProvince || '';
      const region = state ? `${state}, ${country}` : country;
      prevRegionMap.set(
        region,
        (prevRegionMap.get(region) || 0) + Number(order.totalAmount),
      );
    });

    return Array.from(regionMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .map((r) => ({
        region: r.region,
        country: r.country,
        customerCount: r.customerCount.size,
        totalRevenue: this.formatCurrency(r.totalRevenue),
        orderCount: r.orderCount,
        percentage: this.formatCurrency(
          totalRevenue > 0 ? (r.totalRevenue / totalRevenue) * 100 : 0,
        ),
        trend: this.calculateGrowth(
          r.totalRevenue,
          prevRegionMap.get(r.region) || 0,
        ),
      }));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────

  private groupByDate(
    orders: Array<{
      createdAt: Date;
      totalAmount?: { toString(): string } | number;
      shippingCost?: any;
    }>,
    groupBy: 'daily' | 'weekly' | 'monthly',
  ): Array<{ date: string; revenue: string; orders: number }> {
    const groupMap = new Map<string, { revenue: number; count: number }>();

    orders.forEach((order) => {
      const date = this.formatDate(order.createdAt, groupBy);
      if (!groupMap.has(date)) {
        groupMap.set(date, { revenue: 0, count: 0 });
      }
      const existing = groupMap.get(date)!;
      existing.revenue += Number(order.totalAmount || 0);
      existing.count += 1;
    });

    return Array.from(groupMap.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, data]) => ({
        date,
        revenue: this.formatCurrency(data.revenue),
        orders: data.count,
      }));
  }

  private groupWishlistByDate(
    items: Array<{ addedAt: Date }>,
    groupBy: 'daily' | 'weekly' | 'monthly',
    conversionsByDate?: Map<string, number>,
  ): Array<{ date: string; wishlists: number; conversions: number }> {
    const groupMap = new Map<
      string,
      { wishlists: number; conversions: number }
    >();

    items.forEach((item) => {
      const date = this.formatDate(item.addedAt, groupBy);
      if (!groupMap.has(date)) {
        groupMap.set(date, { wishlists: 0, conversions: 0 });
      }
      const groupData = groupMap.get(date)!;
      groupData.wishlists += 1;
    });

    // Merge in conversion data if provided
    if (conversionsByDate) {
      for (const [date, conversions] of conversionsByDate.entries()) {
        if (groupMap.has(date)) {
          groupMap.get(date)!.conversions = conversions;
        } else {
          groupMap.set(date, {
            wishlists: 0,
            conversions,
          });
        }
      }
    }

    return Array.from(groupMap.entries())
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, data]) => ({
        date,
        wishlists: data.wishlists,
        conversions: data.conversions,
      }));
  }

  private formatDate(
    date: Date,
    format: 'daily' | 'weekly' | 'monthly',
  ): string {
    const d = new Date(date);
    if (format === 'daily') {
      return d.toISOString().split('T')[0]; // YYYY-MM-DD
    } else if (format === 'weekly') {
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      return weekStart.toISOString().split('T')[0];
    } else {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
    }
  }

  private getTopWishlistedProducts(
    wishlistItems: Array<{
      productId: string;
      product: { title: string };
    }>,
    limit: number,
    conversionsByProduct: Map<string, number>,
  ): Array<{
    id: string;
    title: string;
    wishlistCount: number;
    conversionCount: number;
    conversionRate: string;
  }> {
    const productMap = new Map<
      string,
      {
        id: string;
        title: string;
        wishlistCount: number;
      }
    >();

    wishlistItems.forEach((item) => {
      if (!productMap.has(item.productId)) {
        productMap.set(item.productId, {
          id: item.productId,
          title: item.product.title,
          wishlistCount: 0,
        });
      }
      productMap.get(item.productId)!.wishlistCount += 1;
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.wishlistCount - a.wishlistCount)
      .slice(0, limit)
      .map((p) => {
        const conversionCount = conversionsByProduct.get(p.id) ?? 0;
        const conversionRate =
          p.wishlistCount > 0
            ? `${Math.round((conversionCount / p.wishlistCount) * 100)}%`
            : '0%';
        return {
          id: p.id,
          title: p.title,
          wishlistCount: p.wishlistCount,
          conversionCount,
          conversionRate,
        };
      });
  }
}
