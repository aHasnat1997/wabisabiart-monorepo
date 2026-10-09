import { Controller, Get, Query, Req } from '@nestjs/common';
import { InsightsService } from './insights.service.js';
import { Auth } from '../../../src/decorators/auth.decorator.js';
import { UserRole } from '@wabisabiart/db';
import {
  SalesIncomeResponse,
  TopProductResponse,
  WishlistAnalyticsResponse,
  CategoryBreakdownResponse,
  CustomersByRegionResponse,
} from './dto/insights.dto.js';
import type { Request } from 'express';

@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  // ─────────────────────────────────────────────────────────────────────────
  // SELLER ROUTES
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /insights/seller/sales-income
   * Seller's store sales and income analytics
   * Query params: ?range=7|30|90|365
   */
  @Get('seller/sales-income')
  @Auth(UserRole.seller)
  async getSellerSalesIncome(
    @Req() req: Request,
    @Query('range') range?: '7' | '30' | '90' | '365',
  ): Promise<SalesIncomeResponse> {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.insightsService.getSalesIncome(sellerId, range || '30');
  }

  /**
   * GET /insights/seller/top-products
   * Seller's top performing products
   * Query params: ?range=7|30|90|365&limit=10
   */
  @Get('seller/top-products')
  @Auth(UserRole.seller)
  async getSellerTopProducts(
    @Req() req: Request,
    @Query('range') range?: '7' | '30' | '90' | '365',
    @Query('limit') limit?: string,
  ): Promise<TopProductResponse[]> {
    const sellerId = req.user?.sellerProfile?.id as string;
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    const finalLimit = Number.isNaN(parsedLimit) ? 10 : parsedLimit;
    return this.insightsService.getTopProducts(
      sellerId,
      range || '30',
      finalLimit,
    );
  }

  /**
   * GET /insights/seller/wishlist-analytics
   * Seller's wishlist analytics
   * Query params: ?range=7|30|90|365
   */
  @Get('seller/wishlist-analytics')
  @Auth(UserRole.seller)
  async getSellerWishlistAnalytics(
    @Req() req: Request,
    @Query('range') range?: '7' | '30' | '90' | '365',
  ): Promise<WishlistAnalyticsResponse> {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.insightsService.getWishlistAnalytics(sellerId, range || '30');
  }

  /**
   * GET /insights/seller/sales-by-category
   * Seller's sales breakdown by category
   * Query params: ?range=7|30|90|365
   */
  @Get('seller/sales-by-category')
  @Auth(UserRole.seller)
  async getSellerSalesByCategory(
    @Req() req: Request,
    @Query('range') range?: '7' | '30' | '90' | '365',
  ): Promise<CategoryBreakdownResponse[]> {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.insightsService.getSalesByCategory(sellerId, range || '30');
  }

  /**
   * GET /insights/seller/customers-by-region
   * Seller's customer distribution by region
   * Query params: ?range=7|30|90|365
   */
  @Get('seller/customers-by-region')
  @Auth(UserRole.seller)
  async getSellerCustomersByRegion(
    @Req() req: Request,
    @Query('range') range?: '7' | '30' | '90' | '365',
  ): Promise<CustomersByRegionResponse[]> {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.insightsService.getCustomersByRegion(sellerId, range || '30');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ADMIN ROUTES - Platform-wide analytics
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /insights/admin/sales-income
   * Platform-wide sales and income analytics
   * Query params: ?range=7|30|90|365&sellerId=<optional filter>
   */
  @Get('admin/sales-income')
  @Auth(UserRole.admin)
  async getAdminSalesIncome(
    @Query('range') range?: '7' | '30' | '90' | '365',
    @Query('sellerId') sellerId?: string,
  ): Promise<SalesIncomeResponse> {
    // If sellerId is provided, filter to that seller. Otherwise show all.
    return this.insightsService.getSalesIncome(sellerId || null, range || '30');
  }

  /**
   * GET /insights/admin/top-products
   * Platform-wide top performing products
   * Query params: ?range=7|30|90|365&limit=10&sellerId=<optional filter>
   */
  @Get('admin/top-products')
  @Auth(UserRole.admin)
  async getAdminTopProducts(
    @Query('range') range?: '7' | '30' | '90' | '365',
    @Query('limit') limit?: string,
    @Query('sellerId') sellerId?: string,
  ): Promise<TopProductResponse[]> {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    const finalLimit = Number.isNaN(parsedLimit) ? 10 : parsedLimit;
    return this.insightsService.getTopProducts(
      sellerId || null,
      range || '30',
      finalLimit,
    );
  }

  /**
   * GET /insights/admin/wishlist-analytics
   * Platform-wide wishlist analytics
   * Query params: ?range=7|30|90|365&sellerId=<optional filter>
   */
  @Get('admin/wishlist-analytics')
  @Auth(UserRole.admin)
  async getAdminWishlistAnalytics(
    @Query('range') range?: '7' | '30' | '90' | '365',
    @Query('sellerId') sellerId?: string,
  ): Promise<WishlistAnalyticsResponse> {
    return this.insightsService.getWishlistAnalytics(
      sellerId || null,
      range || '30',
    );
  }

  /**
   * GET /insights/admin/sales-by-category
   * Platform-wide sales breakdown by category
   * Query params: ?range=7|30|90|365&sellerId=<optional filter>
   */
  @Get('admin/sales-by-category')
  @Auth(UserRole.admin)
  async getAdminSalesByCategory(
    @Query('range') range?: '7' | '30' | '90' | '365',
    @Query('sellerId') sellerId?: string,
  ): Promise<CategoryBreakdownResponse[]> {
    return this.insightsService.getSalesByCategory(
      sellerId || null,
      range || '30',
    );
  }

  /**
   * GET /insights/admin/customers-by-region
   * Platform-wide customer distribution by region
   * Query params: ?range=7|30|90|365&sellerId=<optional filter>
   */
  @Get('admin/customers-by-region')
  @Auth(UserRole.admin)
  async getAdminCustomersByRegion(
    @Query('range') range?: '7' | '30' | '90' | '365',
    @Query('sellerId') sellerId?: string,
  ): Promise<CustomersByRegionResponse[]> {
    return this.insightsService.getCustomersByRegion(
      sellerId || null,
      range || '30',
    );
  }
}
