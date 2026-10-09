import { apiFetch } from "@/lib/apiFetch";
import { SalesIncomeResponse, WishlistAnalyticsResponse } from "@/types/sellerDashboard/Marketting";

export const getsalesIncome = async (): Promise<SalesIncomeResponse> => {
  try {
    const response = await apiFetch<SalesIncomeResponse>(
      "/insights/seller/sales-income",
      { method: "GET" }
    );
    return response;
  } catch (error) {
    console.error("Failed to fetch sales income:", error);
    throw error;
  }
};


export const getCustomersByRegion = async () => {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: Record<string, unknown>[];
    }>("/insights/seller/customers-by-region", { method: "GET" });

    return response;
  } catch (error) {
    console.error("REGION ERROR:", error);
    throw error;
  }
};


export const getCustomerByCategory = async () => {
  try {
    const response = await apiFetch<{
     success: boolean;
     data: Record<string, unknown>[];
    }>("/insights/seller/sales-by-category", { method: "GET" });

    return response;
  } catch (error) {
    console.error("CATEGORY ERROR:", error);
    throw error;
  }
}


export const getwishListAnalytics = async (): Promise<WishlistAnalyticsResponse> => {
  try {
    const response = await apiFetch<WishlistAnalyticsResponse>(
      "/insights/seller/wishlist-analytics",
      { method: "GET" }
    );

    return response;
  } catch (error) {
    console.error("WISHLIST ANALYTICS ERROR:", error);
    throw error;
  }
};

export const getTopSellingProducts = async () => {
  try {
    const response = await apiFetch<{success: boolean; data: unknown[]}>("/insights/seller/top-products", { method: "GET" });
    return response;
    
  } catch (error) {
    console.error("TOP SELLING PRODUCTS ERROR:", error);
    throw error;
  }
}

