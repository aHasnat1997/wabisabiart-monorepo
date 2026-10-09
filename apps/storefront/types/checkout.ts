export interface CheckoutResponse {
  success: boolean;
  message: string;
  meta: Meta;
  data: CheckoutData;
}

export interface Meta {
  timestamp: string;
  path: string;
  method: string;
}

export interface CheckoutData {
  redirectUrl: string;
  data: Order[];
}

export interface Order {
  id: string;
  orderNumber: string;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  subtotal: string;
  shippingCost: string;
  taxAmount: string;
  discountAmount: string;
  tipAmount: string;
  totalAmount: string;
  currency: string;
  shippingAddressId: string;
  couponId: string | null;
  couponCode: string | null;
  markOrderAsGift: boolean;
  buyerNote: string;
  sellerNote: string | null;
  internalNote: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  dispatchedAt: string | null;
  sourceCampaign: string | null;
  acquisitionCost: string | null;
  refundInitiatedAt: string | null;
  refundApprovedAt: string | null;
  refundCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  productTitle: string;
  productSlug: string;
  variantName: string;
  sku: string | null;
  imageUrl: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  customization: string | null;
  giftMessage: string | null;
  createdAt: string;
}

export type OrderStatus =
  | "pending_payment"
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface StripeCheckoutSessionResponse {
  success: boolean;
  message: string;
  meta: Meta;
  data: StripeCheckoutSessionData;
}

export interface Meta {
  timestamp: string;
  path: string;
  method: string;
}

export interface StripeCheckoutSessionData {
  url: string;
}
