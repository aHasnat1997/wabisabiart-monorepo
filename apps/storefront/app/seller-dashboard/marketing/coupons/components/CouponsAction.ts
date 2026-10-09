import { apiFetch } from "@/lib/apiFetch";
import { revalidateMarketting } from "../../components/ServerAction";
import {
  ApiCouponResponse,
  CouponRequestPayload,
  CouponStats,
} from "@/types/sellerDashboard/CouponsItems";

// create coupons
export const createCoupons = async (payload: CouponRequestPayload) => {
  try {
    const data = await apiFetch<{ success: boolean }>(
      "/seller/marketing/coupons",
      { method: "POST", body: payload },
    );

    await revalidateMarketting();

    return data;
  } catch (error) {
    console.error("Create coupons error:", error);
    throw error;
  }
};

// get coupons

export const getCoupons = async (): Promise<ApiCouponResponse[]> => {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: ApiCouponResponse[];
    }>("/seller/marketing/coupons", { method: "GET" });
    return response.data || [];
  } catch (error) {
    console.error("Failed to fetch coupons:", error);
    return [];
  }
};

// get coupon stats

export const getCouponsStats = async (): Promise<CouponStats> => {
  try {
    const response = await apiFetch<{ success: boolean; data: CouponStats }>(
      "/seller/marketing/coupons/stats",
      { method: "GET" },
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch coupons:", error);
    throw error;
  }
};

export const generateRandomCode = async (): Promise<string | null> => {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: { code: string };
    }>("/seller/marketing/coupons/generate-code", { method: "GET" });
    return response.data?.code || null;
  } catch (error) {
    console.error("Failed to generate code:", error);
    return null;
  }
};

// get coupon by id

export const getCouponById = async (id: string) => {
  try {
    const response = await apiFetch<{
      success: boolean;
      data: ApiCouponResponse;
    }>(`/seller/marketing/coupons/${id}`, { method: "GET" });

    await revalidateMarketting();
    return response.data;
  } catch (error) {
    console.error("Failed to fetch coupons:", error);
    throw error;
  }
};

// update coupon code

export const updateCoupon = async (
  id: string,
  payload: CouponRequestPayload,
) => {
  try {
    const data = await apiFetch<{ success: boolean }>(
      `/seller/marketing/coupons/${id}`,

      { method: "PATCH", body: payload },
    );

    await revalidateMarketting();
    return data;
  } catch (error) {
    console.error("Failed to fetch coupons:", error);
    throw error;
  }
};


export const toggleCouponStatus = async (id: string): Promise<{ success: boolean }> => {
  try {
    const data = await apiFetch<{ success: boolean }>(
      `/seller/marketing/coupons/${id}/toggle`, 
      { method: "PATCH" }
    );

    await revalidateMarketting();
    return data;
  } catch (error) {
    console.error("Failed to toggle status:", error);
    throw error;
  }
};

// coupon delete api

export const deleteCoupon = async (id: string): Promise<{ success: boolean }> => {
  try {
    const data = await apiFetch<{ success: boolean }>(
      `/seller/marketing/coupons/${id}`, 
      { method: "DELETE" }
    );

    await revalidateMarketting(); 
    return data;
  } catch (error) {
    console.error("Failed to delete coupon:", error);
    throw error;
  }
};