export type Order = {
  id: number;
  uuid: string; // ← add this
  orderNumber: string;

  customer: {
    name: string;
    email: string;
    avatar: string | null;
  };
  product: string;
  date: string;
  amount: string;
  status: string;
};


export interface RawBuyer {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
}

export interface RawItem {
  id: string;
  productTitle: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  imageUrl: string;
}

export interface RawPayment {
  status: string;
  amount: string;
  processedAt: string;
}

export interface RawOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  currency: string;
  createdAt: string;
  buyer: RawBuyer;
  items: RawItem[];
  payments: RawPayment[];
}

export interface ApiMeta {
  totalData: number;
  totalPages: number;
  page: number;
  limit: number;
  isNextPage: boolean;
  isPreviousPage: boolean;
}

export interface ApiResponse {
  success: boolean;
  data: RawOrder[];
  meta: ApiMeta;
}


export interface OrdersStats {
  totalOrders: number;
  totalRevenue: string | number;
  avgOrderValue: string | number;
  revenueGrowth: string;
  ordersGrowth: string;
}
/* ─── Order History types ────────────────────────────────── */

export interface OrderHistoryEntry {
  id: string;
  orderId: string;
  status: string;
  note: string;
  createdAt: string;
}
 
export interface HistoryApiResponse {
  success: boolean;
  data: OrderHistoryEntry[];
}

// types/sellerDashboard/OrderDetails.ts

export interface OrderDetailsBuyer {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  phoneNumber: string | null;
}

export interface OrderDetailsVariantOption {
  name: string;
  value: string;
  type: string;
}

export interface OrderDetailsVariant {
  id: string;
  name: string;
  mediaUrl: string;
  options: OrderDetailsVariantOption[];
  quantity: number;
  isLowStock: boolean;
}

export interface OrderDetailsItem {
  id: string;
  productTitle: string;
  variantName: string;
  imageUrl: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  sku: string | null;
  variant: OrderDetailsVariant;
}

export interface OrderDetailsShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
}

export interface OrderDetailsShipment {
  id: string;
  carrier: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  status: string;
  shippedAt: string;
  actualDeliveryDate: string | null;
}

export interface OrderDetailsPayment {
  id: string;
  amount: string;
  currency: string;
  status: string;
  provider: string;
  processedAt: string;
}

export interface OrderDetailsStatusHistory {
  id: string;
  status: string;
  note: string;
  createdAt: string;
}

export interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  shippingCost: string;
  taxAmount: string;
  discountAmount: string;
  tipAmount: string;
  totalAmount: string;
  currency: string;
  couponCode: string;
  buyerNote: string;
  sellerNote: string | null;
  paidAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  buyer: OrderDetailsBuyer;
  items: OrderDetailsItem[];
  shippingAddress: OrderDetailsShippingAddress;
  payments: OrderDetailsPayment[];
  shipments: OrderDetailsShipment[];
  refunds: unknown[];
  disputes: unknown[];
  statusHistory: OrderDetailsStatusHistory[];
}

export interface OrderDetailsResponse {
  success: boolean;
  message: string;
  data: OrderDetails;
}

// Shipping order
export interface ShipOrderData {
  id: string;
  orderId: string;
  carrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  status: string;
  shippingLabelUrl: string | null;
  weight: string;
  estimatedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  shippedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Full response type
export interface ShipOrderResponse {
  success: boolean;
  message: string;
  data: ShipOrderData;
}

// deliver 
export interface DeliverOrderResponse {
  success: boolean;
  message: string;
  meta: {
    timestamp: string;
    path: string;
    method: string;
  };
  data: {
    message: string; 
  };
}

export interface InvoiceData {
  invoiceNumber: string;
  issuedAt: string;
  order: { orderNumber: string; createdAt: string; paidAt: string; status: string };
  seller: { shopName: string; shopLogo: string; address: string };
  buyer: { fullName: string; email: string };
  shippingAddress: {
    fullName: string; addressLine1: string; addressLine2: string | null;
    city: string; stateProvince: string; postalCode: string; country: string; phoneNumber: string;
  };
  lineItems: { productTitle: string; variantName: string; sku: string | null; quantity: number; unitPrice: string; totalPrice: string }[];
  summary: { subtotal: string; shippingCost: string; taxAmount: string; discountAmount: string; tipAmount: string; totalAmount: string; currency: string };
  payment: { amount: string; status: string; processedAt: string; provider: string };
}

export interface ShippingLabelData {
  orderNumber: string;
  carrier: string;
  trackingNumber: string | null;
  trackingUrl: string | null;
  weight: string;
  shipFrom: { shopName: string; address: string };
  shipTo: {
    fullName: string; addressLine1: string; addressLine2: string | null;
    city: string; stateProvince: string; postalCode: string; country: string; phoneNumber: string;
  };
  items: { productTitle: string; variantName: string; sku: string | null; quantity: number }[];
  estimatedDelivery: string | null;
}