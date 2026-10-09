export type CustomerType =
  | "New Customer"
  | "All Customer"
  | "VIP Only"
  | "Returning Customer";

export type Coupon = {
  id: string; 
  title: string;
  customerType: CustomerType;
  value: string;
  minPurchase: string;
  expiresDate: string;
  status: "active" | "inactive";
  expiresAt: string;
  createdAt: string;
  usedCount?: number; 
  maxUses?: number;   
};


export type ApiCouponResponse = {
  id: string;
  sellerId: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
  discountValue: string;
  minimumPurchaseAmount: string | null;
  maximumUses: number;
  usedCount: number;
  usageCount: number;
  startsAt: string;
  expiresAt: string;
  customerRestriction: "ALL_CUSTOMERS" | "NEW_CUSTOMERS" | "VIP_CUSTOMERS" | "RETURNING_CUSTOMERS";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CouponRequestPayload = {
  code: string;
  discountType: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
  discountValue: number;
  maximumUses: number;
  expirationDate: string;
  minimumPurchase: number;
  customerRestriction: "ALL_CUSTOMERS" | "NEW_CUSTOMERS" | "VIP_CUSTOMERS" | "RETURNING_CUSTOMERS";
  isActive: boolean;
};

export interface CouponStats {
  activeCoupons: number;
  totalRedemptions: number;
}