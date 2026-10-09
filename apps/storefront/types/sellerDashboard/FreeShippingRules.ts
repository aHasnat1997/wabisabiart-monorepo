export type ShippingRuleStatus = "active" | "inactive";

export type ShippingRule = {
  id: number;
  title: string;
  minAmount: number;
  region: string;
  orders: number;
  status: ShippingRuleStatus;
};


export type ShippingRegion =
  | "All Countries"
  | "United States"
  | "International"
  | "Asia"
  | "Europe";

export type CreateShippingRuleData = {
  name: string;
  minOrderAmount: number;
  region: ShippingRegion;
};

export const defaultShippingRule: CreateShippingRuleData = {
  name: "",
  minOrderAmount: 0,
  region: "All Countries",
};


export interface ShippingConfig {
  id: string;
  sellerId: string;
  isEnabled: boolean;
  minimumOrderAmount: string; 
  triggerCount: number;
  updatedAt: string;
}

export interface ShippingConfigResponse {
  success: boolean;
  message: string;
  data: ShippingConfig;
}

export interface UpdateShippingPayload {
  isEnabled?: boolean;
  minimumOrderAmount?: number;
}

export interface ApiShippingRule {
  id: string;
  sellerId: string;
  name: string;
  minimumOrderAmount: string; 
  region: string;
  isActive: boolean;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
}