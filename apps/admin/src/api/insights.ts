import { api } from './axios.js';

export interface DailyChartData {
  date: string;
  revenue: string;
  orders: number;
}

export interface RevenueBreakdown {
  productSales: string;
  shippingFees: string;
  tips: string;
}

export interface SalesIncomeData {
  totalRevenue: string;
  totalOrders: number;
  averageOrderValue: string;
  revenueGrowth: string;
  ordersGrowth: string;
  dailyData: DailyChartData[];
  revenueBreakdown: RevenueBreakdown;
}

export interface TopProductData {
  id: string;
  title: string;
  imageUrl?: string;
  totalSold: number;
  totalRevenue: string;
  averageRating: string;
  reviewCount: number;
  trend?: string;
}

export interface WishlistDailyData {
  date: string;
  wishlists: number;
  conversions: number;
}

export interface TopWishlistedProduct {
  id: string;
  title: string;
  wishlistCount: number;
  conversionCount: number;
  conversionRate: string;
}

export interface WishlistAnalyticsData {
  totalWishlists: number;
  wishlistConversions: number;
  conversionRate: string;
  wishlistGrowth: string;
  dailyData: WishlistDailyData[];
  topWishlistedProducts: TopWishlistedProduct[];
}

export interface CategoryBreakdownData {
  categoryName: string;
  categoryId: string;
  totalRevenue: string;
  totalSales: number;
  percentage: string;
  trend?: string;
}

export interface CustomersByRegionData {
  region: string;
  country?: string;
  customerCount: number;
  totalRevenue: string;
  orderCount: number;
  percentage: string;
  trend?: string;
}

export type DateRange = '7' | '30' | '90' | '365';

export const insightsApi = {
  // ─── SELLER ROUTES ───────────────────────────────────────────────────────

  seller: {
    getSalesIncome: (range: DateRange = '30') =>
      api.get<{ data: SalesIncomeData }>('/insights/seller/sales-income', {
        params: { range },
      }),

    getTopProducts: (range: DateRange = '30', limit: number = 10) =>
      api.get<{ data: TopProductData[] }>('/insights/seller/top-products', {
        params: { range, limit },
      }),

    getWishlistAnalytics: (range: DateRange = '30') =>
      api.get<{ data: WishlistAnalyticsData }>(
        '/insights/seller/wishlist-analytics',
        {
          params: { range },
        },
      ),

    getSalesByCategory: (range: DateRange = '30') =>
      api.get<{ data: CategoryBreakdownData[] }>(
        '/insights/seller/sales-by-category',
        {
          params: { range },
        },
      ),

    getCustomersByRegion: (range: DateRange = '30') =>
      api.get<{ data: CustomersByRegionData[] }>(
        '/insights/seller/customers-by-region',
        {
          params: { range },
        },
      ),
  },

  // ─── ADMIN ROUTES ────────────────────────────────────────────────────────

  admin: {
    getSalesIncome: (range: DateRange = '30', sellerId?: string) =>
      api.get<{ data: SalesIncomeData }>('/insights/admin/sales-income', {
        params: { range, ...(sellerId && { sellerId }) },
      }),

    getTopProducts: (
      range: DateRange = '30',
      limit: number = 10,
      sellerId?: string,
    ) =>
      api.get<{ data: TopProductData[] }>('/insights/admin/top-products', {
        params: { range, limit, ...(sellerId && { sellerId }) },
      }),

    getWishlistAnalytics: (range: DateRange = '30', sellerId?: string) =>
      api.get<{ data: WishlistAnalyticsData }>(
        '/insights/admin/wishlist-analytics',
        {
          params: { range, ...(sellerId && { sellerId }) },
        },
      ),

    getSalesByCategory: (range: DateRange = '30', sellerId?: string) =>
      api.get<{ data: CategoryBreakdownData[] }>(
        '/insights/admin/sales-by-category',
        {
          params: { range, ...(sellerId && { sellerId }) },
        },
      ),

    getCustomersByRegion: (range: DateRange = '30', sellerId?: string) =>
      api.get<{ data: CustomersByRegionData[] }>(
        '/insights/admin/customers-by-region',
        {
          params: { range, ...(sellerId && { sellerId }) },
        },
      ),
  },
};
