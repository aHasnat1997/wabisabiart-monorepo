

export interface  PromotionStats  {
  activePromotions: number;
  totalDiscountsGiven: number;
  couponRedemptions: number;
  freeShippingOrders: number;
};



export interface SalesIncomeResponse {
  success: boolean;
  data: {
    totalRevenue: string;
    totalOrders: number;
    averageOrderValue: string;
    revenueGrowth: string;
    ordersGrowth: string;
    dailyData: unknown[];
    revenueBreakdown: {
      productSales: string;
      shippingFees: string;
      tips: string;
    };
  };
}

export interface WishlistProduct {
  productTitle: string;
  totalWishlists: number;
  conversions: number;
  conversionRate: string;
}

export interface WishlistAnalyticsData {
  totalWishlists: number;
  wishlistConversions: number;
  conversionRate: string;
  wishlistGrowth: string;
  dailyData: {
    date: string;
    count: number;
  }[];
  topWishlistedProducts: WishlistProduct[];
}

export interface WishlistAnalyticsResponse {
  success: boolean;
  message: string;
  meta: {
    timestamp: string;
    path: string;
    method: string;
  };
  data: WishlistAnalyticsData;
}
