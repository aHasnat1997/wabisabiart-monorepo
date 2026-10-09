import { Controller, Get, Query, Req } from '@nestjs/common';
import { Auth } from '../../../src/decorators/auth.decorator.js';
import { UserRole } from '@wabisabiart/db';
import type { Request } from 'express';
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
import { SellerDashboardService } from './seller-dashboard.service.js';

@Controller('seller-dashboard')
export class SellerDashboardController {
  constructor(private readonly dashboardService: SellerDashboardService) {}

  // ─────────────────────────────────────────────────────────────────────────
  // ORDERS DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /seller-dashboard/orders/summary
   * Seller's order analytics summary
   * Query params: ?range=7|30|90|365
   */
  @Get('orders/summary')
  @Auth(UserRole.seller)
  async getOrderSummary(
    @Req() req: Request,
    @Query('range') range?: '7' | '30' | '90' | '365',
  ): Promise<OrderSummaryResponse> {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.dashboardService.getOrderSummary(sellerId, range || '30');
  }

  /**
   * GET /seller-dashboard/orders/status-breakdown
   * Order status breakdown (pending, paid, shipped, delivered, etc.)
   * Query params: ?range=7|30|90|365
   */
  @Get('orders/status-breakdown')
  @Auth(UserRole.seller)
  async getOrderStatusBreakdown(
    @Req() req: Request,
    @Query('range') range?: '7' | '30' | '90' | '365',
  ): Promise<OrderStatusBreakdownResponse> {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.dashboardService.getOrderStatusBreakdown(
      sellerId,
      range || '30',
    );
  }

  /**
   * GET /seller-dashboard/orders/past-due
   * Orders that are past due (unpaid > 30 days)
   * Query params: ?page=1&limit=10
   */
  @Get('orders/past-due')
  @Auth(UserRole.seller)
  async getPastDueOrders(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PastDueOrdersResponse> {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.dashboardService.getPastDueOrders(
      sellerId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  /**
   * GET /seller-dashboard/orders/delivery-delays
   * Orders with delivery delays
   * Query params: ?page=1&limit=10
   */
  @Get('orders/delivery-delays')
  @Auth(UserRole.seller)
  async getDeliveryDelays(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<DeliveryDelaysResponse> {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.dashboardService.getDeliveryDelays(
      sellerId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  /**
   * GET /seller-dashboard/orders/refunds
   * Refund requests and analytics
   * Query params: ?page=1&limit=10
   */
  @Get('orders/refunds')
  @Auth(UserRole.seller)
  async getRefunds(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<RefundsResponse> {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.dashboardService.getRefunds(
      sellerId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  /**
   * GET /seller-dashboard/orders/disputes
   * Order disputes and resolutions
   * Query params: ?page=1&limit=10
   */
  @Get('orders/disputes')
  @Auth(UserRole.seller)
  async getDisputes(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<DisputesResponse> {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.dashboardService.getDisputes(
      sellerId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MARKETING & GROWTH DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /seller-dashboard/marketing/summary
   * Marketing summary with revenue, orders, customers, conversion rate
   * Query params: ?range=7|30|90|365
   */
  @Get('marketing/summary')
  @Auth(UserRole.seller)
  async getMarketingSummary(
    @Req() req: Request,
    @Query('range') range?: '7' | '30' | '90' | '365',
  ): Promise<MarketingSummaryResponse> {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.dashboardService.getMarketingSummary(sellerId, range || '30');
  }

  /**
   * GET /seller-dashboard/marketing/activity-feed
   * Recent activity: orders, reviews, wishlist adds
   * Query params: ?page=1&limit=50
   */
  @Get('marketing/activity-feed')
  @Auth(UserRole.seller)
  async getActivityFeed(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<ActivityFeedResponse> {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.dashboardService.getActivityFeed(
      sellerId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  /**
   * GET /seller-dashboard/marketing/engagement-metrics
   * Customer engagement: reviews, wishlist, cart
   * Query params: ?range=7|30|90|365
   */
  @Get('marketing/engagement-metrics')
  @Auth(UserRole.seller)
  async getEngagementMetrics(
    @Req() req: Request,
    @Query('range') range?: '7' | '30' | '90' | '365',
  ): Promise<EngagementMetricsResponse> {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.dashboardService.getEngagementMetrics(sellerId, range || '30');
  }

  /**
   * GET /seller-dashboard/marketing/top-products
   * Top performing products by revenue and units sold
   * Query params: ?range=7|30|90|365
   */
  @Get('marketing/top-products')
  @Auth(UserRole.seller)
  async getTopProducts(
    @Req() req: Request,
    @Query('range') range?: '7' | '30' | '90' | '365',
  ): Promise<TopProductsResponse> {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.dashboardService.getTopProducts(sellerId, range || '30');
  }

  /**
   * GET /seller-dashboard/marketing/customer-growth
   * New customer growth trend over time
   * Query params: ?range=7|30|90|365
   */
  @Get('marketing/customer-growth')
  @Auth(UserRole.seller)
  async getCustomerGrowth(
    @Req() req: Request,
    @Query('range') range?: '7' | '30' | '90' | '365',
  ): Promise<CustomerGrowthResponse> {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.dashboardService.getCustomerGrowth(sellerId, range || '30');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CUSTOMERS DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /seller-dashboard/customers/stats
   * Customer statistics: total, avg value, likes, comments
   * Query params: ?range=7|30|90|365
   */
  @Get('customers/stats')
  @Auth(UserRole.seller)
  async getCustomerStats(
    @Req() req: Request,
    @Query('range') range?: '7' | '30' | '90' | '365',
  ): Promise<CustomerStatsResponse> {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.dashboardService.getCustomerStats(sellerId, range || '30');
  }

  /**
   * GET /seller-dashboard/customers/list
   * Paginated list of customers with details
   * Query params: ?page=1&limit=20
   */
  @Get('customers/list')
  @Auth(UserRole.seller)
  async getCustomersList(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<CustomersListResponse> {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.dashboardService.getCustomersList(
      sellerId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  /**
   * GET /seller-dashboard/customers/engagement-metrics
   * Customer engagement detailed metrics
   * Query params: ?range=7|30|90|365
   */
  @Get('customers/engagement-metrics')
  @Auth(UserRole.seller)
  async getEngagementMetricsDetailed(
    @Req() req: Request,
    @Query('range') range?: '7' | '30' | '90' | '365',
  ): Promise<EngagementMetricsDetailedResponse> {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.dashboardService.getEngagementMetricsDetailed(
      sellerId,
      range || '30',
    );
  }

  /**
   * GET /seller-dashboard/customers/regional-breakdown
   * Customer distribution by country/region
   */
  @Get('customers/regional-breakdown')
  @Auth(UserRole.seller)
  async getRegionalBreakdown(
    @Req() req: Request,
  ): Promise<RegionalBreakdownResponse> {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.dashboardService.getRegionalBreakdown(sellerId);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INSIGHTS & ANALYTICS DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /seller-dashboard/insights/net-income
   * Calculate net income after fees and refunds
   * Query params: ?range=7|30|90|365
   */
  @Get('insights/net-income')
  @Auth(UserRole.seller)
  async getNetIncome(
    @Req() req: Request,
    @Query('range') range?: '7' | '30' | '90' | '365',
  ): Promise<NetIncomeResponse> {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.dashboardService.getNetIncome(sellerId, range || '30');
  }

  /**
   * GET /seller-dashboard/insights/top-products-status
   * Top products with sale velocity and stock status
   * Query params: ?range=7|30|90|365
   */
  @Get('insights/top-products-status')
  @Auth(UserRole.seller)
  async getTopProductsStatus(
    @Req() req: Request,
    @Query('range') range?: '7' | '30' | '90' | '365',
  ): Promise<TopProductsStatusResponse> {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.dashboardService.getTopProductsStatus(sellerId, range || '30');
  }

  /**
   * GET /seller-dashboard/insights/inventory-health
   * Inventory health check: low stock and overstock alerts
   */
  @Get('insights/inventory-health')
  @Auth(UserRole.seller)
  async getInventoryHealth(
    @Req() req: Request,
  ): Promise<InventoryHealthResponse> {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.dashboardService.getInventoryHealth(sellerId);
  }

  /**
   * GET /seller-dashboard/insights/revenue-breakdown
   * Revenue breakdown by category and payment method
   * Query params: ?range=7|30|90|365
   */
  @Get('insights/revenue-breakdown')
  @Auth(UserRole.seller)
  async getRevenueBreakdown(
    @Req() req: Request,
    @Query('range') range?: '7' | '30' | '90' | '365',
  ): Promise<RevenueBreakdownResponse> {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.dashboardService.getRevenueBreakdown(sellerId, range || '30');
  }
}
