import { apiFetch } from "@/lib/apiFetch";

export interface WishlistConfig {
  id: string;
  isEnabled: boolean;
  discountPercentage: number;
  validityDays: number;
  sendEmailNotification: boolean;
  autoApplyAtCheckout: boolean;
}

export interface WishlistStats {
  wishlistedItems: number;
  couponsGenerated: number;
  couponsRedeemed: number;
  revenueGenerated: number;
  generationRate: string;
  redemptionRate: string;
}

export const getWishlistConfig = async (): Promise<WishlistConfig> => {
  const res = await apiFetch<{ data: WishlistConfig }>("/seller/marketing/wishlist-coupons/config", { method: "GET" });
  return res.data;
};

export const updateWishlistConfig = async (payload: Partial<WishlistConfig>) => {
  return await apiFetch("/seller/marketing/wishlist-coupons/config", {
    method: "PATCH",
    body: payload,
  });
};

export const toggleWishlistConfig = async (payload: Partial<WishlistConfig>) => {
  return await apiFetch("/seller/marketing/wishlist-coupons/config/toggle", {
    method: "PATCH",
    body: payload,
  });
};


export const getWishlistConfigStats = async (): Promise<WishlistStats> => {
  try {
    const res = await apiFetch<{ success: boolean; data: WishlistStats }>(
      "/seller/marketing/wishlist-coupons/stats",
      { method: "GET" }
    );
    return res.data || {
      wishlistedItems: 0,
      couponsGenerated: 0,
      couponsRedeemed: 0,
      revenueGenerated: 0,
      generationRate: "0%",
      redemptionRate: "0%"
    };
  } catch (error) {
    console.error("Fetch stats error:", error);
    throw error;
  }
};


export interface WishlistActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  amount: string;
  createdBy: string;
  createdAt: string;
}

export const getActivityFeed = async (): Promise<WishlistActivity[]> => {
  try {
    const res = await apiFetch<{ success: boolean; data: { activities: WishlistActivity[] } }>(
      "/seller-dashboard/marketing/activity-feed?page=1&limit=50",
      { method: "GET" }
    );
    
    return res?.data?.activities || []; 
    
  } catch (error) {
    console.error("Activity feed error:", error);
    return [];
  }
};

