import { createZodDto } from 'nestjs-zod';
import z from 'zod';

// ──────────────────
// Helper Schemas
// ──────────────────

const DateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  range: z.enum(['7', '30', '90', '365']).optional(),
});

// ─────────────────────────────────────────────────────────────────────────
// SALES & INCOME
// ─────────────────────────────────────────────────────────────────────────

const DailyChartDataSchema = z.object({
  date: z.string(),
  revenue: z.string(),
  orders: z.number().int().nonnegative(),
});

const RevenueBreakdownSchema = z.object({
  productSales: z.string(),
  shippingFees: z.string(),
  tips: z.string(),
});

const SalesIncomeSchema = z.object({
  totalRevenue: z.string(),
  totalOrders: z.number().int().nonnegative(),
  averageOrderValue: z.string(),
  revenueGrowth: z.string(), // percentage
  ordersGrowth: z.string(), // percentage
  dailyData: z.array(DailyChartDataSchema),
  revenueBreakdown: RevenueBreakdownSchema,
});

// ─────────────────────────────────────────────────────────────────────────
// TOP PRODUCTS
// ─────────────────────────────────────────────────────────────────────────

const TopProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  imageUrl: z.string().optional(),
  totalSold: z.number().int().nonnegative(),
  totalRevenue: z.string(),
  averageRating: z.string(),
  reviewCount: z.number().int().nonnegative(),
  conversionRate: z.string().optional(),
  trend: z.string().optional(), // percentage
});

// ─────────────────────────────────────────────────────────────────────────
// WISHLIST ANALYTICS
// ─────────────────────────────────────────────────────────────────────────

const WishlistDailyDataSchema = z.object({
  date: z.string(),
  wishlists: z.number().int().nonnegative(),
  conversions: z.number().int().nonnegative(),
});

const TopWishlistedProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  wishlistCount: z.number().int().nonnegative(),
  conversionCount: z.number().int().nonnegative(),
  conversionRate: z.string(),
});

const WishlistAnalyticsSchema = z.object({
  totalWishlists: z.number().int().nonnegative(),
  wishlistConversions: z.number().int().nonnegative(),
  conversionRate: z.string(), // percentage
  wishlistGrowth: z.string(), // percentage
  revenue: z.string(), // from wishlist conversions
  dailyData: z.array(WishlistDailyDataSchema),
  topWishlistedProducts: z.array(TopWishlistedProductSchema),
});

// ─────────────────────────────────────────────────────────────────────────
// CATEGORY BREAKDOWN
// ─────────────────────────────────────────────────────────────────────────

const CategoryBreakdownSchema = z.object({
  categoryName: z.string(),
  categoryId: z.string(),
  totalRevenue: z.string(),
  totalSales: z.number().int().nonnegative(),
  percentage: z.string(), // of total revenue
  trend: z.string().optional(), // percentage growth
});

// ─────────────────────────────────────────────────────────────────────────
// CUSTOMERS BY REGION
// ─────────────────────────────────────────────────────────────────────────

const CustomersByRegionSchema = z.object({
  region: z.string(),
  country: z.string().optional(),
  customerCount: z.number().int().nonnegative(),
  totalRevenue: z.string(),
  orderCount: z.number().int().nonnegative(),
  percentage: z.string(), // of total
  trend: z.string().optional(), // percentage growth
});

// ─────────────────────────────────────────────────────────────────────────
// EXPORT OPTIONS
// ─────────────────────────────────────────────────────────────────────────

const ExportSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  downloadUrl: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────────────────
// DTO Classes
// ─────────────────────────────────────────────────────────────────────────

export class DateRangeDto extends createZodDto(DateRangeSchema) {}
export class SalesIncomeResponse extends createZodDto(SalesIncomeSchema) {}
export class TopProductResponse extends createZodDto(TopProductSchema) {}
export class WishlistAnalyticsResponse extends createZodDto(
  WishlistAnalyticsSchema,
) {}
export class CategoryBreakdownResponse extends createZodDto(
  CategoryBreakdownSchema,
) {}
export class CustomersByRegionResponse extends createZodDto(
  CustomersByRegionSchema,
) {}
export class InsightsExportResponse extends createZodDto(ExportSchema) {}

// ─────────────────────────────────────────────────────────────────────────
// Type Exports (for TypeScript inference)
// ─────────────────────────────────────────────────────────────────────────

export type DateRange = z.infer<typeof DateRangeSchema>;
export type SalesIncomeData = z.infer<typeof SalesIncomeSchema>;
export type TopProductData = z.infer<typeof TopProductSchema>;
export type WishlistAnalyticsData = z.infer<typeof WishlistAnalyticsSchema>;
export type CategoryBreakdownData = z.infer<typeof CategoryBreakdownSchema>;
export type CustomersByRegionData = z.infer<typeof CustomersByRegionSchema>;
export type InsightsExport = z.infer<typeof ExportSchema>;
