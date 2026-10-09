import { createZodDto } from 'nestjs-zod';
import z from 'zod';

// ─────────────────────────────────────────────────────────────────────────
// ORDERS DASHBOARD
// ─────────────────────────────────────────────────────────────────────────

const OrderSummarySchema = z.object({
  totalOrders: z.number().int().nonnegative(),
  totalRevenue: z.string(),
  avgOrderValue: z.string(),
  revenueGrowth: z.string(), // percentage
  ordersGrowth: z.string(), // percentage
});

const OrderStatusItem = z.object({
  status: z.string(),
  count: z.number().int().nonnegative(),
  percentage: z.string(),
  revenue: z.string(),
});

const OrderStatusBreakdownSchema = z.object({
  statuses: z.array(OrderStatusItem),
  totalOrders: z.number().int().nonnegative(),
  totalRevenue: z.string(),
});

const PastDueOrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  buyerName: z.string(),
  buyerEmail: z.string(),
  amount: z.string(),
  paidAt: z.string(),
  daysOverdue: z.number().int().nonnegative(),
  status: z.string(),
});

const PastDueOrdersResponseSchema = z.object({
  totalPastDueOrders: z.number().int().nonnegative(),
  totalPastDueAmount: z.string(),
  orders: z.array(PastDueOrderSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  }),
});

const DeliveryDelaySchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  buyerName: z.string(),
  amount: z.string(),
  expectedDeliveryDate: z.string(),
  actualDeliveryDate: z.string().optional(),
  status: z.string(),
  delayDays: z.number().int().nonnegative(),
});

const DeliveryDelaysResponseSchema = z.object({
  totalDelayedOrders: z.number().int().nonnegative(),
  avgDelayDays: z.string(),
  orders: z.array(DeliveryDelaySchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  }),
});

const RefundRequestSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  amount: z.string(),
  reason: z.string(),
  status: z.string(),
  requestedAt: z.string(),
  processedAt: z.string().optional(),
});

const RefundsResponseSchema = z.object({
  totalRefunds: z.number().int().nonnegative(),
  totalRefundAmount: z.string(),
  refundRate: z.string(), // percentage
  topRefundReason: z.string().optional(),
  refunds: z.array(RefundRequestSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  }),
});

const DisputeSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  buyerName: z.string(),
  amount: z.string(),
  reason: z.string(),
  status: z.string(),
  openedAt: z.string(),
  resolvedAt: z.string().optional(),
  daysOpen: z.number().int().nonnegative(),
});

const DisputesResponseSchema = z.object({
  activeDisputes: z.number().int().nonnegative(),
  resolvedDisputes: z.number().int().nonnegative(),
  disputes: z.array(DisputeSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  }),
});

// ─────────────────────────────────────────────────────────────────────────
// MARKETING & GROWTH DASHBOARD
// ─────────────────────────────────────────────────────────────────────────

const MarketingSummarySchema = z.object({
  totalRevenue: z.string(),
  totalOrders: z.number().int().nonnegative(),
  totalCustomers: z.number().int().nonnegative(),
  newCustomers: z.number().int().nonnegative(),
  conversionRate: z.string(), // percentage
  avgOrderValue: z.string(),
});

const ActivityItemSchema = z.object({
  id: z.string(),
  type: z.string(), // "order" | "review" | "wishlist"
  title: z.string(),
  description: z.string().optional(),
  amount: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  createdBy: z.string(),
  createdAt: z.string(),
});

const ActivityFeedResponseSchema = z.object({
  activities: z.array(ActivityItemSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  }),
});

const EngagementMetricsSchema = z.object({
  totalReviews: z.number().int().nonnegative(),
  avgRating: z.string(),
  reviewsThisPeriod: z.number().int().nonnegative(),
  wishlistAdds: z.number().int().nonnegative(),
  wishlistRemoves: z.number().int().nonnegative(),
  wishlistConversion: z.string(), // percentage
  cartAdds: z.number().int().nonnegative(),
});

const TopProductMetricsSchema = z.object({
  id: z.string(),
  title: z.string(),
  imageUrl: z.string().optional(),
  totalSold: z.number().int().nonnegative(),
  totalRevenue: z.string(),
  avgRating: z.string(),
  reviewCount: z.number().int().nonnegative(),
  rank: z.number().int().positive(),
});

const TopProductsResponseSchema = z.object({
  topByRevenue: z.array(TopProductMetricsSchema),
  topByUnits: z.array(TopProductMetricsSchema),
});

const GrowthDataPointSchema = z.object({
  date: z.string(),
  newCustomers: z.number().int().nonnegative(),
  repeatingCustomers: z.number().int().nonnegative(),
  revenue: z.string(),
});

const CustomerGrowthResponseSchema = z.object({
  totalNewCustomers: z.number().int().nonnegative(),
  growthRate: z.string(), // percentage
  dailyData: z.array(GrowthDataPointSchema),
});

// ─────────────────────────────────────────────────────────────────────────
// CUSTOMERS DASHBOARD
// ─────────────────────────────────────────────────────────────────────────

const CustomerStatsSchema = z.object({
  totalCustomers: z.number().int().nonnegative(),
  newCustomersThisPeriod: z.number().int().nonnegative(),
  returningCustomers: z.number().int().nonnegative(),
  avgCustomerValue: z.string(),
  totalReviewsCount: z.number().int().nonnegative(),
  totalLikes: z.number().int().nonnegative(),
  totalComments: z.number().int().nonnegative(),
});

const CustomerListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  totalOrders: z.number().int().nonnegative(),
  totalSpent: z.string(),
  avgOrderValue: z.string(),
  lastOrderDate: z.string().optional(),
  likeCount: z.number().int().nonnegative(),
  reviewCount: z.number().int().nonnegative(),
});

const CustomersListResponseSchema = z.object({
  customers: z.array(CustomerListItemSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
  }),
});

const EngagementMetricsDetailedSchema = z.object({
  totalReviews: z.number().int().nonnegative(),
  totalLikes: z.number().int().nonnegative(),
  totalComments: z.number().int().nonnegative(),
  avgRating: z.string(),
  reviewsThisPeriod: z.number().int().nonnegative(),
  likesThisPeriod: z.number().int().nonnegative(),
  commentsThisPeriod: z.number().int().nonnegative(),
});

const RegionalBreakdownSchema = z.object({
  country: z.string(),
  region: z.string().optional(),
  customerCount: z.number().int().nonnegative(),
  totalRevenue: z.string(),
  totalOrders: z.number().int().nonnegative(),
  percentage: z.string(), // of total customers
});

const RegionalBreakdownResponseSchema = z.object({
  breakdown: z.array(RegionalBreakdownSchema),
  totalCustomers: z.number().int().nonnegative(),
  totalRevenue: z.string(),
});

// ─────────────────────────────────────────────────────────────────────────
// INSIGHTS & ANALYTICS DASHBOARD
// ─────────────────────────────────────────────────────────────────────────

const NetIncomeDataSchema = z.object({
  date: z.string(),
  grossRevenue: z.string(),
  platformFees: z.string(),
  refunds: z.string(),
  netIncome: z.string(),
});

const NetIncomeResponseSchema = z.object({
  totalGrossRevenue: z.string(),
  totalPlatformFees: z.string(),
  totalRefunds: z.string(),
  totalNetIncome: z.string(),
  netIncomeGrowth: z.string(), // percentage
  dailyData: z.array(NetIncomeDataSchema),
});

const TopProductStatusSchema = z.object({
  id: z.string(),
  title: z.string(),
  imageUrl: z.string().optional(),
  totalSold: z.number().int().nonnegative(),
  totalRevenue: z.string(),
  avgRating: z.string(),
  saleVelocity: z.string(), // units per day
  trend: z.string().optional(), // percentage growth
});

const TopProductsStatusResponseSchema = z.object({
  topProducts: z.array(TopProductStatusSchema),
});

const InventoryAlertSchema = z.object({
  id: z.string(),
  title: z.string(),
  sku: z.string().optional(),
  currentStock: z.number().int().nonnegative(),
  lowStockThreshold: z.number().int().nonnegative(),
  alertType: z.string(), // "low_stock" | "overstock"
  status: z.string(),
});

const InventoryHealthResponseSchema = z.object({
  lowStockProducts: z.array(InventoryAlertSchema),
  overstockProducts: z.array(InventoryAlertSchema),
  healthScore: z.string(), // percentage
});

const RevenueBreakdownItemSchema = z.object({
  category: z.string(),
  value: z.string(),
  percentage: z.string(),
  orders: z.number().int().nonnegative(),
});

const RevenueBreakdownResponseSchema = z.object({
  byCategory: z.array(RevenueBreakdownItemSchema),
  byPaymentMethod: z.array(RevenueBreakdownItemSchema),
  totalRevenue: z.string(),
});

// ─────────────────────────────────────────────────────────────────────────
// EXPORT DTO CLASSES
// ─────────────────────────────────────────────────────────────────────────

// Orders Dashboard
export class OrderSummaryResponse extends createZodDto(OrderSummarySchema) {}
export class OrderStatusBreakdownResponse extends createZodDto(
  OrderStatusBreakdownSchema,
) {}
export class PastDueOrdersResponse extends createZodDto(
  PastDueOrdersResponseSchema,
) {}
export class DeliveryDelaysResponse extends createZodDto(
  DeliveryDelaysResponseSchema,
) {}
export class RefundsResponse extends createZodDto(RefundsResponseSchema) {}
export class DisputesResponse extends createZodDto(DisputesResponseSchema) {}

// Marketing Dashboard
export class MarketingSummaryResponse extends createZodDto(
  MarketingSummarySchema,
) {}
export class ActivityFeedResponse extends createZodDto(
  ActivityFeedResponseSchema,
) {}
export class EngagementMetricsResponse extends createZodDto(
  EngagementMetricsSchema,
) {}
export class TopProductsResponse extends createZodDto(
  TopProductsResponseSchema,
) {}
export class CustomerGrowthResponse extends createZodDto(
  CustomerGrowthResponseSchema,
) {}

// Customers Dashboard
export class CustomerStatsResponse extends createZodDto(CustomerStatsSchema) {}
export class CustomersListResponse extends createZodDto(
  CustomersListResponseSchema,
) {}
export class EngagementMetricsDetailedResponse extends createZodDto(
  EngagementMetricsDetailedSchema,
) {}
export class RegionalBreakdownResponse extends createZodDto(
  RegionalBreakdownResponseSchema,
) {}

// Insights Dashboard
export class NetIncomeResponse extends createZodDto(NetIncomeResponseSchema) {}
export class TopProductsStatusResponse extends createZodDto(
  TopProductsStatusResponseSchema,
) {}
export class InventoryHealthResponse extends createZodDto(
  InventoryHealthResponseSchema,
) {}
export class RevenueBreakdownResponse extends createZodDto(
  RevenueBreakdownResponseSchema,
) {}

// ─────────────────────────────────────────────────────────────────────────
// TYPE EXPORTS
// ─────────────────────────────────────────────────────────────────────────

export type OrderSummary = z.infer<typeof OrderSummarySchema>;
export type OrderStatusBreakdown = z.infer<typeof OrderStatusBreakdownSchema>;
export type PastDueOrders = z.infer<typeof PastDueOrdersResponseSchema>;
export type DeliveryDelays = z.infer<typeof DeliveryDelaysResponseSchema>;
export type Refunds = z.infer<typeof RefundsResponseSchema>;
export type Disputes = z.infer<typeof DisputesResponseSchema>;
export type MarketingSummary = z.infer<typeof MarketingSummarySchema>;
export type ActivityFeed = z.infer<typeof ActivityFeedResponseSchema>;
export type EngagementMetrics = z.infer<typeof EngagementMetricsSchema>;
export type TopProducts = z.infer<typeof TopProductsResponseSchema>;
export type CustomerGrowth = z.infer<typeof CustomerGrowthResponseSchema>;
export type CustomerStats = z.infer<typeof CustomerStatsSchema>;
export type CustomersList = z.infer<typeof CustomersListResponseSchema>;
export type EngagementMetricsDetailed = z.infer<
  typeof EngagementMetricsDetailedSchema
>;
export type RegionalBreakdown = z.infer<typeof RegionalBreakdownResponseSchema>;
export type NetIncome = z.infer<typeof NetIncomeResponseSchema>;
export type TopProductsStatus = z.infer<typeof TopProductsStatusResponseSchema>;
export type InventoryHealth = z.infer<typeof InventoryHealthResponseSchema>;
export type RevenueBreakdown = z.infer<typeof RevenueBreakdownResponseSchema>;
