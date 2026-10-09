export type PromotionItem = {
  id: string;
  title: string;
  type: "Percentage" | "Fixed" |"BOGO";
  value: string;
  status: "Active" | "Inactive";
  appliedTo: string[];
  uses: number;
  revenue: string;
  period: string;
};


export interface BackendPromotion {
  id: string;
  name: string;
  discountType: "FIXED" | "PERCENTAGE" | "BOGO";
  discountValue: string | number;
  applyTo: "ALL_PRODUCTS" | "BY_CATEGORY" | "SPECIFIC_PRODUCTS";
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  usageCount: number;
  minimumPurchase?: string | number;
  usageLimit?: number;
  onePerCustomer?: boolean;
  categories?: { id: string }[];
  products?: { id: string }[];
}
