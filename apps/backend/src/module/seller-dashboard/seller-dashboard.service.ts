import { Injectable } from '@nestjs/common';
import { PrismaService } from '@wabisabiart/db';
import {
  OrderSummaryResponse,
  OrderStatusBreakdownResponse,
  PastDueOrdersResponse,
  DeliveryDelaysResponse,
  RefundsResponse,
  DisputesResponse,
  MarketingSummaryResponse,
  ActivityFeedResponse,
  EngagementMetricsResponse,
  TopProductsResponse,
  CustomerGrowthResponse,
  CustomerStatsResponse,
  CustomersListResponse,
  EngagementMetricsDetailedResponse,
  RegionalBreakdownResponse,
  NetIncomeResponse,
  TopProductsStatusResponse,
  InventoryHealthResponse,
  RevenueBreakdownResponse,
} from './dto/seller-dashboard.dto.js';

interface DelayedShipmentItem {
  id: string;
  orderNumber: string;
  buyerName: string;
  amount: string;
  expectedDeliveryDate: string;
  actualDeliveryDate: string;
  status: any;
  delayDays: number;
}

@Injectable()
export class SellerDashboardService {
  constructor(private readonly prisma: PrismaService) {}

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
        startDate.setDate(endDate.getDate() - 30);
    }

    return { startDate, endDate };
  }

  private formatCurrency(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toFixed(2);
  }

  private formatPercentage(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${num.toFixed(2)}%`;
  }

  private calculateGrowth(current: number, previous: number): string {
    if (previous === 0) return '0.00%';
    const growth = ((current - previous) / previous) * 100;
    return `${growth >= 0 ? '+' : ''}${growth.toFixed(2)}%`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ORDERS DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────

  async getOrderSummary(
    sellerId: string,
    range: '7' | '30' | '90' | '365' = '30',
  ): Promise<OrderSummaryResponse> {
    const { startDate, endDate } = this.getDateRange(range);
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(
      prevStartDate.getDate() -
        Math.floor(
          (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24),
        ),
    );

    const whereClause = {
      sellerId,
      createdAt: { gte: startDate, lte: endDate },
    };

    const prevWhereClause = {
      sellerId,
      createdAt: { gte: prevStartDate, lt: startDate },
    };

    const [currentOrders, previousOrders] = await Promise.all([
      this.prisma.order.findMany({
        where: whereClause,
        select: { totalAmount: true },
      }),
      this.prisma.order.findMany({
        where: prevWhereClause,
        select: { totalAmount: true },
      }),
    ]);

    const currentRevenue = currentOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0,
    );
    const previousRevenue = previousOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0,
    );
    const avgOrderValue =
      currentOrders.length > 0 ? currentRevenue / currentOrders.length : 0;
    // const previousAvgOrderValue =
    //   previousOrders.length > 0 ? previousRevenue / previousOrders.length : 0;

    return {
      totalOrders: currentOrders.length,
      totalRevenue: this.formatCurrency(currentRevenue),
      avgOrderValue: this.formatCurrency(avgOrderValue),
      revenueGrowth: this.calculateGrowth(currentRevenue, previousRevenue),
      ordersGrowth: this.calculateGrowth(
        currentOrders.length,
        previousOrders.length,
      ),
    };
  }

  async getOrderStatusBreakdown(
    sellerId: string,
    range: '7' | '30' | '90' | '365' = '30',
  ): Promise<OrderStatusBreakdownResponse> {
    const { startDate, endDate } = this.getDateRange(range);

    const orders = await this.prisma.order.findMany({
      where: {
        sellerId,
        createdAt: { gte: startDate, lte: endDate },
      },
      select: { id: true, status: true, totalAmount: true },
    });

    const statusBreakdown = new Map<string, { count: number; revenue: number }>(
      [
        ['pending_payment', { count: 0, revenue: 0 }],
        ['paid', { count: 0, revenue: 0 }],
        ['processing', { count: 0, revenue: 0 }],
        ['shipped', { count: 0, revenue: 0 }],
        ['delivered', { count: 0, revenue: 0 }],
        ['cancelled', { count: 0, revenue: 0 }],
        ['refunded', { count: 0, revenue: 0 }],
        ['disputed', { count: 0, revenue: 0 }],
      ],
    );

    orders.forEach((order) => {
      const status = order.status as string;
      const current = statusBreakdown.get(status) || { count: 0, revenue: 0 };
      current.count += 1;
      current.revenue += Number(order.totalAmount);
      statusBreakdown.set(status, current);
    });

    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0,
    );

    const statuses = Array.from(statusBreakdown.entries()).map(
      ([status, data]) => ({
        status,
        count: data.count,
        percentage: this.formatPercentage(
          totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
        ),
        revenue: this.formatCurrency(data.revenue),
      }),
    );

    return {
      statuses,
      totalOrders: orders.length,
      totalRevenue: this.formatCurrency(totalRevenue),
    };
  }

  async getPastDueOrders(
    sellerId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PastDueOrdersResponse> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          sellerId,
          status: { in: ['pending_payment', 'payment_failed'] },
          createdAt: { lte: thirtyDaysAgo },
        },
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          paidAt: true,
          status: true,
          createdAt: true,
          buyer: { select: { fullName: true, email: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.order.count({
        where: {
          sellerId,
          status: { in: ['pending_payment', 'payment_failed'] },
          createdAt: { lte: thirtyDaysAgo },
        },
      }),
    ]);

    const pastDueOrders = orders.map((order) => {
      const createdDate = new Date(order.createdAt);
      const now = new Date();
      const daysOverdue = Math.floor(
        (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24),
      );

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        buyerName: order.buyer.fullName,
        buyerEmail: order.buyer.email,
        amount: this.formatCurrency(Number(order.totalAmount)),
        paidAt: order.paidAt ? new Date(order.paidAt).toISOString() : 'N/A',
        daysOverdue,
        status: order.status,
      };
    });

    const totalPastDueAmount = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0,
    );

    return {
      totalPastDueOrders: total,
      totalPastDueAmount: this.formatCurrency(totalPastDueAmount),
      orders: pastDueOrders,
      pagination: { page, limit, total },
    };
  }

  async getDeliveryDelays(
    sellerId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<DeliveryDelaysResponse> {
    const [shipments, total] = await Promise.all([
      this.prisma.shipment.findMany({
        where: {
          order: { sellerId },
          estimatedDeliveryDate: { not: null },
          actualDeliveryDate: { not: null },
        },
        select: {
          id: true,
          estimatedDeliveryDate: true,
          actualDeliveryDate: true,
          status: true,
          order: {
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,
              buyer: { select: { fullName: true } },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.shipment.count({
        where: {
          order: { sellerId },
          estimatedDeliveryDate: { not: null },
          actualDeliveryDate: { not: null },
        },
      }),
    ]);

    const delayedShipments: DelayedShipmentItem[] = shipments
      .map((shipment) => {
        const estimated = new Date(shipment.estimatedDeliveryDate!);
        const actual = new Date(shipment.actualDeliveryDate!);
        const delayDays = Math.floor(
          (actual.getTime() - estimated.getTime()) / (1000 * 3600 * 24),
        );

        if (delayDays <= 0) return null;

        return {
          id: shipment.order.id,
          orderNumber: shipment.order.orderNumber,
          buyerName: shipment.order.buyer.fullName,
          amount: this.formatCurrency(Number(shipment.order.totalAmount)),
          expectedDeliveryDate: estimated.toISOString().split('T')[0],
          actualDeliveryDate: actual.toISOString().split('T')[0],
          status: shipment.status,
          delayDays,
        };
      })
      .filter((item): item is DelayedShipmentItem => item !== null);

    const avgDelayDays =
      delayedShipments.length > 0
        ? delayedShipments.reduce((sum, s) => sum + s.delayDays, 0) /
          delayedShipments.length
        : 0;

    return {
      totalDelayedOrders: delayedShipments.length,
      avgDelayDays: this.formatCurrency(avgDelayDays),
      orders: delayedShipments,
      pagination: { page, limit, total },
    };
  }

  async getRefunds(
    sellerId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<RefundsResponse> {
    const [refunds, total] = await Promise.all([
      this.prisma.refund.findMany({
        where: {
          order: { sellerId },
        },
        select: {
          id: true,
          amount: true,
          reason: true,
          status: true,
          requestedAt: true,
          processedAt: true,
          order: { select: { orderNumber: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { requestedAt: 'desc' },
      }),
      this.prisma.refund.count({
        where: {
          order: { sellerId },
        },
      }),
    ]);

    const allRefunds = await this.prisma.refund.findMany({
      where: { order: { sellerId } },
      select: { reason: true, amount: true },
    });

    const refundReasons = new Map<string, number>();
    let totalRefundValue = 0;
    allRefunds.forEach((ref) => {
      const reason = ref.reason || 'Unknown';
      refundReasons.set(reason, (refundReasons.get(reason) || 0) + 1);
      totalRefundValue += Number(ref.amount);
    });

    const topRefundReason = Array.from(refundReasons.entries()).sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0];

    const orders = await this.prisma.order.findMany({
      where: { sellerId },
      select: { totalAmount: true },
    });

    const totalOrderRevenue = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0,
    );

    const refundRate = this.formatPercentage(
      totalOrderRevenue > 0 ? (totalRefundValue / totalOrderRevenue) * 100 : 0,
    );

    const refundList = refunds.map((ref) => ({
      id: ref.id,
      orderNumber: ref.order.orderNumber,
      amount: this.formatCurrency(Number(ref.amount)),
      reason: ref.reason,
      status: ref.status,
      requestedAt: new Date(ref.requestedAt).toISOString(),
      processedAt: ref.processedAt
        ? new Date(ref.processedAt).toISOString()
        : undefined,
    }));

    return {
      totalRefunds: total,
      totalRefundAmount: this.formatCurrency(totalRefundValue),
      refundRate,
      topRefundReason,
      refunds: refundList,
      pagination: { page, limit, total },
    };
  }

  async getDisputes(
    sellerId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<DisputesResponse> {
    const [disputes, total] = await Promise.all([
      this.prisma.dispute.findMany({
        where: {
          order: { sellerId },
        },
        select: {
          id: true,
          reason: true,
          status: true,
          openedAt: true,
          resolvedAt: true,
          order: {
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,
              buyer: { select: { fullName: true } },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { openedAt: 'desc' },
      }),
      this.prisma.dispute.count({
        where: {
          order: { sellerId },
        },
      }),
    ]);

    const now = new Date();
    const disputeList = disputes.map((dispute) => {
      const openedDate = new Date(dispute.openedAt);
      const daysOpen = dispute.resolvedAt
        ? Math.floor(
            (new Date(dispute.resolvedAt).getTime() - openedDate.getTime()) /
              (1000 * 3600 * 24),
          )
        : Math.floor(
            (now.getTime() - openedDate.getTime()) / (1000 * 3600 * 24),
          );

      return {
        id: dispute.id,
        orderNumber: dispute.order.orderNumber,
        buyerName: dispute.order.buyer.fullName,
        amount: this.formatCurrency(Number(dispute.order.totalAmount)),
        reason: dispute.reason,
        status: dispute.status,
        openedAt: openedDate.toISOString(),
        resolvedAt: dispute.resolvedAt
          ? new Date(dispute.resolvedAt).toISOString()
          : undefined,
        daysOpen,
      };
    });

    const activeDisputes = disputeList.filter(
      (d) =>
        d.status === 'open' ||
        d.status === 'under_review' ||
        d.status === 'escalated',
    ).length;
    const resolvedDisputes = disputeList.filter(
      (d) =>
        d.status === 'resolved_buyer' ||
        d.status === 'resolved_seller' ||
        d.status === 'closed',
    ).length;

    return {
      activeDisputes,
      resolvedDisputes,
      disputes: disputeList,
      pagination: { page, limit, total },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MARKETING & GROWTH DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────

  async getMarketingSummary(
    sellerId: string,
    range: '7' | '30' | '90' | '365' = '30',
  ): Promise<MarketingSummaryResponse> {
    const { startDate, endDate } = this.getDateRange(range);

    const currentOrders = await this.prisma.order.findMany({
      where: {
        sellerId,
        createdAt: { gte: startDate, lte: endDate },
      },
      select: { totalAmount: true, buyerId: true },
    });

    const currentRevenue = currentOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0,
    );

    const uniqueCustomers = new Set(currentOrders.map((o) => o.buyerId)).size;
    const avgOrderValue =
      currentOrders.length > 0 ? currentRevenue / currentOrders.length : 0;

    return {
      totalRevenue: this.formatCurrency(currentRevenue),
      totalOrders: currentOrders.length,
      totalCustomers: uniqueCustomers,
      newCustomers: uniqueCustomers,
      conversionRate: this.formatPercentage(
        currentOrders.length > 0
          ? (uniqueCustomers / currentOrders.length) * 100
          : 0,
      ),
      avgOrderValue: this.formatCurrency(avgOrderValue),
    };
  }

  async getActivityFeed(
    sellerId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<ActivityFeedResponse> {
    const skip = (page - 1) * limit;

    const [orders, reviews, wishlists, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { sellerId },
        select: {
          id: true,
          orderNumber: true,
          totalAmount: true,
          createdAt: true,
          buyer: { select: { fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      this.prisma.review.findMany({
        where: {
          product: { sellerId },
        },
        select: {
          id: true,
          comment: true,
          rating: true,
          createdAt: true,
          user: { select: { fullName: true } },
          product: { select: { title: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      this.prisma.wishlistItem.findMany({
        where: {
          product: { sellerId },
        },
        select: {
          id: true,
          addedAt: true,
          product: { select: { title: true } },
          wishlist: { select: { user: { select: { fullName: true } } } },
        },
        orderBy: { addedAt: 'desc' },
        take: limit,
        skip,
      }),
      this.prisma.order.count({ where: { sellerId } }),
    ]);

    const activities = [
      ...orders.map((order) => ({
        id: order.id,
        type: 'order' as const,
        title: `Order ${order.orderNumber}`,
        description: `from ${order.buyer.fullName}`,
        amount: this.formatCurrency(Number(order.totalAmount)),
        createdBy: order.buyer.fullName,
        createdAt: new Date(order.createdAt).toISOString(),
      })),
      ...reviews.map((review) => ({
        id: review.id,
        type: 'review' as const,
        title: review.comment ? review.comment.slice(0, 50) : 'New Review',
        description: `on ${review.product.title}`,
        rating: review.rating,
        createdBy: review.user.fullName,
        createdAt: new Date(review.createdAt).toISOString(),
      })),
      ...wishlists.map((wishlist) => ({
        id: wishlist.id,
        type: 'wishlist' as const,
        title: `Wishlist Add`,
        description: `${wishlist.product.title}`,
        createdBy: wishlist.wishlist.user.fullName,
        createdAt: new Date(wishlist.addedAt).toISOString(),
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, limit);

    return {
      activities,
      pagination: { page, limit, total },
    };
  }

  async getEngagementMetrics(
    sellerId: string,
    range: '7' | '30' | '90' | '365' = '30',
  ): Promise<EngagementMetricsResponse> {
    const { startDate, endDate } = this.getDateRange(range);

    const reviews = await this.prisma.review.findMany({
      where: {
        product: { sellerId },
      },
      select: { helpfulCount: true },
    });

    const newReviews = await this.prisma.review.findMany({
      where: {
        product: { sellerId },
        createdAt: { gte: startDate, lte: endDate },
      },
      select: { id: true },
    });

    const wishlists = await this.prisma.wishlistItem.findMany({
      where: {
        product: { sellerId },
        addedAt: { gte: startDate, lte: endDate },
      },
    });

    const totalReviews = reviews.length;
    const avgRating = this.formatCurrency(
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + (r.helpfulCount || 0), 0) /
            totalReviews
        : 0,
    );

    const conversionRate =
      wishlists.length > 0 ? (wishlists.length / wishlists.length) * 100 : 0;

    return {
      totalReviews,
      avgRating,
      reviewsThisPeriod: newReviews.length,
      wishlistAdds: wishlists.length,
      wishlistRemoves: 0,
      wishlistConversion: this.formatPercentage(conversionRate),
      cartAdds: 0,
    };
  }

  async getTopProducts(
    sellerId: string,
    range: '7' | '30' | '90' | '365' = '30',
  ): Promise<TopProductsResponse> {
    const { startDate, endDate } = this.getDateRange(range);

    const products = await this.prisma.product.findMany({
      where: {
        sellerId,
      },
      select: {
        id: true,
        title: true,
        reviews: {
          select: { rating: true },
        },
      },
    });

    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        product: { sellerId },
        order: {
          createdAt: { gte: startDate, lte: endDate },
        },
      },
      select: { productId: true, quantity: true, totalPrice: true },
    });

    const productMetrics = products.map((product) => {
      const items = orderItems.filter((item) => item.productId === product.id);
      const totalSold = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalRevenue = items.reduce(
        (sum, item) => sum + Number(item.totalPrice),
        0,
      );
      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
            product.reviews.length
          : 0;

      return {
        id: product.id,
        title: product.title || '',
        imageUrl: undefined,
        totalSold,
        totalRevenue,
        avgRating: this.formatCurrency(avgRating),
        reviewCount: product.reviews.length,
      };
    });

    const sortedByRevenue = productMetrics
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5)
      .map((p, index) => ({
        ...p,
        totalRevenue: this.formatCurrency(p.totalRevenue),
        rank: index + 1,
      }));

    const sortedByUnits = productMetrics
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5)
      .map((p, index) => ({
        ...p,
        totalRevenue: this.formatCurrency(p.totalRevenue),
        rank: index + 1,
      }));

    return {
      topByRevenue: sortedByRevenue,
      topByUnits: sortedByUnits,
    };
  }

  async getCustomerGrowth(
    sellerId: string,
    range: '7' | '30' | '90' | '365' = '30',
  ): Promise<CustomerGrowthResponse> {
    const { startDate, endDate } = this.getDateRange(range);

    const orders = await this.prisma.order.findMany({
      where: {
        sellerId,
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        id: true,
        createdAt: true,
        totalAmount: true,
        buyerId: true,
      },
    });

    const dailyGrouped = new Map<
      string,
      { new: number; returning: number; revenue: number }
    >();

    orders.forEach((order) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      const current = dailyGrouped.get(date) || {
        new: 1,
        returning: 0,
        revenue: 0,
      };
      current.revenue += Number(order.totalAmount);
      dailyGrouped.set(date, current);
    });

    const dailyData = Array.from(dailyGrouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        newCustomers: data.new,
        repeatingCustomers: data.returning,
        revenue: this.formatCurrency(data.revenue),
      }));

    const uniqueCustomers = new Set(orders.map((o) => o.buyerId)).size;

    return {
      totalNewCustomers: uniqueCustomers,
      growthRate: this.formatPercentage(
        orders.length > 0 ? (uniqueCustomers / orders.length) * 100 : 0,
      ),
      dailyData,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CUSTOMERS DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────

  async getCustomerStats(
    sellerId: string,
    range: '7' | '30' | '90' | '365' = '30',
  ): Promise<CustomerStatsResponse> {
    const { startDate, endDate } = this.getDateRange(range);

    const allOrders = await this.prisma.order.findMany({
      where: { sellerId },
      select: { buyerId: true, totalAmount: true },
    });

    const newCustomers = await this.prisma.order.findMany({
      where: {
        sellerId,
        createdAt: { gte: startDate, lte: endDate },
      },
      select: { buyerId: true },
      distinct: ['buyerId'],
    });

    const reviews = await this.prisma.review.findMany({
      where: {
        product: { sellerId },
      },
      select: { helpfulCount: true },
    });

    const totalCustomers = new Set(allOrders.map((o) => o.buyerId)).size;
    const avgCustomerValue =
      totalCustomers > 0
        ? allOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0) /
          totalCustomers
        : 0;
    const totalLikes = reviews.reduce((sum, r) => sum + r.helpfulCount, 0);

    return {
      totalCustomers,
      newCustomersThisPeriod: newCustomers.length,
      returningCustomers: totalCustomers - newCustomers.length,
      avgCustomerValue: this.formatCurrency(avgCustomerValue),
      totalReviewsCount: reviews.length,
      totalLikes,
      totalComments: reviews.length,
    };
  }

  async getCustomersList(
    sellerId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<CustomersListResponse> {
    const [customers, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { sellerId },
        select: {
          buyerId: true,
          buyer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              reviews: true,
            },
          },
          totalAmount: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({
        where: {
          buyerOrders: {
            some: { sellerId },
          },
        },
      }),
    ]);

    const customerMap = new Map<
      string,
      {
        id: string;
        name: string;
        email: string;
        orderCount: number;
        totalSpent: number;
        avgOrderValue: number;
        lastOrderDate?: Date;
        reviewCount: number;
        likeCount: number;
      }
    >();

    for (const order of customers) {
      const existing = customerMap.get(order.buyerId);
      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += Number(order.totalAmount);
        if (
          !existing.lastOrderDate ||
          order.createdAt > existing.lastOrderDate
        ) {
          existing.lastOrderDate = order.createdAt;
        }
      } else {
        customerMap.set(order.buyerId, {
          id: order.buyer.id,
          name: order.buyer.fullName,
          email: order.buyer.email,
          orderCount: 1,
          totalSpent: Number(order.totalAmount),
          avgOrderValue: Number(order.totalAmount),
          lastOrderDate: order.createdAt,
          reviewCount: order.buyer.reviews.length,
          likeCount: order.buyer.reviews.reduce(
            (sum, r) => sum + r.helpfulCount,
            0,
          ),
        });
      }
    }

    const customerData = Array.from(customerMap.values())
      .slice((page - 1) * limit, page * limit)
      .map((customer) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        totalOrders: customer.orderCount,
        totalSpent: this.formatCurrency(customer.totalSpent),
        avgOrderValue: this.formatCurrency(
          customer.totalSpent / customer.orderCount,
        ),
        lastOrderDate: customer.lastOrderDate?.toISOString(),
        likeCount: customer.likeCount,
        reviewCount: customer.reviewCount,
      }));

    return {
      customers: customerData,
      pagination: { page, limit, total },
    };
  }

  async getEngagementMetricsDetailed(
    sellerId: string,
    range: '7' | '30' | '90' | '365' = '30',
  ): Promise<EngagementMetricsDetailedResponse> {
    const { startDate, endDate } = this.getDateRange(range);

    const allReviews = await this.prisma.review.findMany({
      where: { product: { sellerId } },
      select: { id: true, helpfulCount: true, rating: true, createdAt: true },
    });

    const thisRangeReviews = allReviews.filter(
      (r) => r.createdAt >= startDate && r.createdAt <= endDate,
    );

    const allLikes = allReviews.reduce((sum, r) => sum + r.helpfulCount, 0);
    const thisLikes = thisRangeReviews.reduce(
      (sum, r) => sum + r.helpfulCount,
      0,
    );

    const avgRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0;

    return {
      totalReviews: allReviews.length,
      totalLikes: allLikes,
      totalComments: allReviews.length,
      avgRating: this.formatCurrency(avgRating),
      reviewsThisPeriod: thisRangeReviews.length,
      likesThisPeriod: thisLikes,
      commentsThisPeriod: thisRangeReviews.length,
    };
  }

  async getRegionalBreakdown(
    sellerId: string,
  ): Promise<RegionalBreakdownResponse> {
    const orders = await this.prisma.order.findMany({
      where: { sellerId },
      select: {
        id: true,
        totalAmount: true,
        shippingAddress: {
          select: {
            country: true,
            stateProvince: true,
          },
        },
        buyer: {
          select: {
            id: true,
            addresses: {
              select: { country: true, stateProvince: true },
            },
          },
        },
      },
    });

    const regionalMap = new Map<
      string,
      {
        country: string;
        region: string | null;
        customerCount: number;
        totalRevenue: number;
        orderCount: number;
      }
    >();

    orders.forEach((order) => {
      const country =
        order.shippingAddress?.country ||
        order.buyer.addresses[0]?.country ||
        'Unknown';
      const region = order.shippingAddress?.stateProvince || null;
      const key = `${country}-${region || 'N/A'}`;

      const existing = regionalMap.get(key) || {
        country,
        region,
        customerCount: 1,
        totalRevenue: 0,
        orderCount: 0,
      };

      existing.totalRevenue += Number(order.totalAmount);
      existing.orderCount += 1;
      regionalMap.set(key, existing);
    });

    const totalRevenue = orders.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0,
    );
    const totalCustomers = new Set(orders.map((o) => o.buyer.id)).size;

    const breakdown = Array.from(regionalMap.values()).map((data) => ({
      country: data.country,
      region: data.region || undefined,
      customerCount: data.customerCount,
      totalRevenue: this.formatCurrency(data.totalRevenue),
      totalOrders: data.orderCount,
      percentage: this.formatPercentage(
        totalCustomers > 0 ? (data.customerCount / totalCustomers) * 100 : 0,
      ),
    }));

    return {
      breakdown,
      totalCustomers,
      totalRevenue: this.formatCurrency(totalRevenue),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INSIGHTS & ANALYTICS DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────

  async getNetIncome(
    sellerId: string,
    range: '7' | '30' | '90' | '365' = '30',
  ): Promise<NetIncomeResponse> {
    const { startDate, endDate } = this.getDateRange(range);

    const platformFee = await this.prisma.platformFeeSetting.findFirst();
    const platformFeePercent = platformFee?.platformFeePercent || 5;

    const orders = await this.prisma.order.findMany({
      where: {
        sellerId,
        createdAt: { gte: startDate, lte: endDate },
      },
      select: { id: true, totalAmount: true, createdAt: true },
    });

    const refunds = await this.prisma.refund.findMany({
      where: {
        order: { sellerId },
        completedAt: { gte: startDate, lte: endDate },
      },
      select: { amount: true, completedAt: true },
    });

    const totalGrossRevenue = orders.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0,
    );
    const totalPlatformFees =
      (totalGrossRevenue * Number(platformFeePercent)) / 100;
    const totalRefunds = refunds.reduce((sum, r) => sum + Number(r.amount), 0);
    const totalNetIncome = totalGrossRevenue - totalPlatformFees - totalRefunds;

    // Build daily breakdown
    const dailyGrouped = new Map<
      string,
      {
        grossRevenue: number;
        platformFees: number;
        refunds: number;
        netIncome: number;
      }
    >();

    orders.forEach((order) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      const current = dailyGrouped.get(date) || {
        grossRevenue: 0,
        platformFees: 0,
        refunds: 0,
        netIncome: 0,
      };
      const amount = Number(order.totalAmount);
      const fees = (amount * Number(platformFeePercent)) / 100;

      current.grossRevenue += amount;
      current.platformFees += fees;
      current.netIncome += amount - fees;
      dailyGrouped.set(date, current);
    });

    refunds.forEach((refund) => {
      if (!refund.completedAt) return;
      const date = new Date(refund.completedAt).toISOString().split('T')[0];
      const current = dailyGrouped.get(date) || {
        grossRevenue: 0,
        platformFees: 0,
        refunds: 0,
        netIncome: 0,
      };
      const refundAmount = Number(refund.amount);

      current.refunds += refundAmount;
      current.netIncome -= refundAmount;
      dailyGrouped.set(date, current);
    });

    const dailyData = Array.from(dailyGrouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        grossRevenue: this.formatCurrency(data.grossRevenue),
        platformFees: this.formatCurrency(data.platformFees),
        refunds: this.formatCurrency(data.refunds),
        netIncome: this.formatCurrency(data.netIncome),
      }));

    return {
      totalGrossRevenue: this.formatCurrency(totalGrossRevenue),
      totalPlatformFees: this.formatCurrency(totalPlatformFees),
      totalRefunds: this.formatCurrency(totalRefunds),
      totalNetIncome: this.formatCurrency(totalNetIncome),
      netIncomeGrowth: '0.00%',
      dailyData,
    };
  }

  async getTopProductsStatus(
    sellerId: string,
    range: '7' | '30' | '90' | '365' = '30',
  ): Promise<TopProductsStatusResponse> {
    const { startDate, endDate } = this.getDateRange(range);

    const products = await this.prisma.product.findMany({
      where: { sellerId },
      select: {
        id: true,
        title: true,
        reviews: { select: { rating: true } },
      },
    });

    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        product: { sellerId },
        order: {
          createdAt: { gte: startDate, lte: endDate },
        },
      },
      select: { productId: true, quantity: true, totalPrice: true },
    });

    const daysDiff =
      (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);

    const topProducts = products
      .map((product) => {
        const items = orderItems.filter(
          (item) => item.productId === product.id,
        );
        const totalSold = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalRevenue = items.reduce(
          (sum, item) => sum + Number(item.totalPrice),
          0,
        );
        const saleVelocity = daysDiff > 0 ? totalSold / daysDiff : 0;
        const avgRating =
          product.reviews.length > 0
            ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
              product.reviews.length
            : 0;

        return {
          id: product.id,
          title: product.title || '',
          imageUrl: undefined,
          totalSold,
          totalRevenue: this.formatCurrency(totalRevenue),
          avgRating: this.formatCurrency(avgRating),
          saleVelocity: this.formatCurrency(saleVelocity),
        };
      })
      .filter((p) => p.totalSold > 0)
      .sort((a, b) => Number(b.totalRevenue) - Number(a.totalRevenue))
      .slice(0, 10);

    return { topProducts };
  }

  async getInventoryHealth(sellerId: string): Promise<InventoryHealthResponse> {
    const products = await this.prisma.product.findMany({
      where: { sellerId },
      select: {
        id: true,
        title: true,
        lowStockThreshold: true,
        variants: {
          select: { quantity: true },
        },
      },
    });

    const lowStockProducts: {
      id: string;
      title: string;
      sku: string;
      currentStock: number;
      lowStockThreshold: number;
      alertType: string;
      status: string;
    }[] = [];
    const overstockProducts: {
      id: string;
      title: string;
      sku: string;
      currentStock: number;
      lowStockThreshold: number;
      alertType: string;
      status: string;
    }[] = [];

    products.forEach((product) => {
      const totalQuantity = product.variants.reduce(
        (sum, v) => sum + v.quantity,
        0,
      );

      if (totalQuantity < product.lowStockThreshold) {
        lowStockProducts.push({
          id: product.id,
          title: product.title || 'Unknown',
          sku: 'N/A',
          currentStock: totalQuantity,
          lowStockThreshold: product.lowStockThreshold,
          alertType: 'low_stock',
          status: 'warning',
        });
      }

      if (totalQuantity > product.lowStockThreshold * 2) {
        overstockProducts.push({
          id: product.id,
          title: product.title || 'Unknown',
          sku: 'N/A',
          currentStock: totalQuantity,
          lowStockThreshold: product.lowStockThreshold,
          alertType: 'overstock',
          status: 'info',
        });
      }
    });

    const healthScore =
      products.length > 0
        ? ((products.length - lowStockProducts.length) / products.length) * 100
        : 0;

    return {
      lowStockProducts,
      overstockProducts,
      healthScore: this.formatPercentage(healthScore),
    };
  }

  async getRevenueBreakdown(
    sellerId: string,
    range: '7' | '30' | '90' | '365' = '30',
  ): Promise<RevenueBreakdownResponse> {
    const { startDate, endDate } = this.getDateRange(range);

    const orders = await this.prisma.order.findMany({
      where: {
        sellerId,
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        totalAmount: true,
        items: {
          select: {
            product: { select: { category: { select: { name: true } } } },
            totalPrice: true,
          },
        },
        payments: {
          select: { provider: true },
        },
      },
    });

    const categoryMap = new Map<
      string,
      { revenue: number; orderCount: number }
    >();
    const paymentMethodMap = new Map<
      string,
      { revenue: number; orderCount: number }
    >();

    const totalRevenue = orders.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0,
    );

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const category = item.product.category?.name || 'Uncategorized';
        const current = categoryMap.get(category) || {
          revenue: 0,
          orderCount: 0,
        };
        current.revenue += Number(item.totalPrice);
        current.orderCount += 1;
        categoryMap.set(category, current);
      });

      order.payments.forEach((payment) => {
        const method = payment.provider || 'Unknown';
        const current = paymentMethodMap.get(method) || {
          revenue: 0,
          orderCount: 0,
        };
        current.revenue += Number(order.totalAmount);
        current.orderCount += 1;
        paymentMethodMap.set(method, current);
      });
    });

    const byCategory = Array.from(categoryMap.entries()).map(
      ([category, data]) => ({
        category,
        value: this.formatCurrency(data.revenue),
        percentage: this.formatPercentage((data.revenue / totalRevenue) * 100),
        orders: data.orderCount,
      }),
    );

    const byPaymentMethod = Array.from(paymentMethodMap.entries()).map(
      ([method, data]) => ({
        category: method,
        value: this.formatCurrency(data.revenue),
        percentage: this.formatPercentage((data.revenue / totalRevenue) * 100),
        orders: data.orderCount,
      }),
    );

    return {
      byCategory,
      byPaymentMethod,
      totalRevenue: this.formatCurrency(totalRevenue),
    };
  }
}
