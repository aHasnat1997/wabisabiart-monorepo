/* ---------------- API ---------------- */

export interface ApiMeta {
  timestamp: string;
  path: string;
  method: string;
  page?: number;
  limit?: number;
  totalData?: number;
  totalPages?: number;
  isNextPage?: boolean;
  isPreviousPage?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  meta: ApiMeta;
  data: T;
}

/* ---------------- ORDER ---------------- */

export type OrderStatus =
  | "pending_payment"
  | "payment_failed"
  | "paid"
  | "processing"
  | "shipped"
  | "in_transit"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "disputed";

export type OrderAction =
  | "receipt"
  | "track"
  | "help"
  | "visitShop"
  | "cancel"
  | "return"
  | "pay"
  | "retry";

export interface OrderProduct {
  id: string;
  productTitle: string;
  slug: string;
  variantName: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderPayment {
  status: string;
  amount: number;
  processedAt: string | null;
}

export interface OrderRefund {
  id: string;
  amount: number;
  reason?: string;
  status: string;
  createdAt: string;
}

export interface OrderShipment {
  id: string;
  carrier?: string;
  trackingNumber?: string;
  status: string;
  shippedAt?: string | null;
  deliveredAt?: string | null;
}

export interface OrderSeller {
  shopName: string;
  shopLogo: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  currency: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  tipAmount: number;
  totalAmount: number;
  markOrderAsGift: boolean;
  buyerNote: string | null;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderProduct[];
  payments: OrderPayment[];
  refunds: OrderRefund[];
  shipments: OrderShipment[];
  seller: OrderSeller;
}

export type OrdersResponse = ApiResponse<Order[]>;

/* ---------------- CART ---------------- */

export interface CartCalculation {
  totalItems: number;
  itemsTotal: number;
  shopDiscount: number;
  subtotal: number;
  shipping: number;
  total: number;
  couponDiscount: number;
}

export interface SellerProfile {
  shopName: string;
  averageRating: string;
  totalReviews: number;
}

export interface Seller {
  sellerProfile: SellerProfile;
}

export interface VariantOption {
  name: string;
  value: string;
  type: string;
}

export interface Variant {
  id: string;
  mediaUrl: string;
  options: VariantOption[];
  quantity: number;
}

export interface CartProduct {
  id: string;
  title: string;
  price: string;
  discountType: "none" | "fixed_amount" | "percentage";
  discountValue: string;
  finalPrice: number;
  seller: Seller;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId: string;
  quantity: number;
  customization: unknown | null;
  addedAt: string;
  updatedAt: string;
  product: CartProduct;
  variant: Variant;
}

export interface Cart {
  id: string;
  userId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
}

export type CartResponse = ApiResponse<Cart>;
export type CartCalculateResponse = ApiResponse<CartCalculation>;


/* ---------------- ORDER DETAILS ---------------- */

export interface ShippingAddress {
  id: string;
  userId: string;
  fullName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
  label: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  note: string;
  createdBy: string;
  createdAt: string;
}

export interface OrderPaymentDetails extends OrderPayment {
  id: string;
  orderId: string;
  paymentMethodId: string | null;
  currency: string;
  provider: string;
  providerTransactionId: string | null;
  providerResponse: unknown | null;
  failureReason: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface OrderDetailsItem extends OrderProduct {
  orderId: string;
  productId: string;
  variantId: string;
  productSlug: string;
  sku: string | null;
  customization: unknown | null;
  giftMessage: string | null;
  createdAt: string;

  product: {
    id: string;
    title: string;
  };

  variant: Variant & {
    productId: string;
    name: string;
    isLowStock: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface OrderDetails extends Omit<
  Order,
  "items" | "payments" | "seller"
> {
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;

  buyerId: string;
  sellerId: string;

  shippingAddressId: string;

  couponId: string | null;
  couponCode: string | null;

  sellerNote: string | null;
  internalNote: string | null;

  ipAddress: string | null;
  userAgent: string | null;

  dispatchedAt: string | null;

  sourceCampaign: string | null;
  acquisitionCost: string | null;

  refundInitiatedAt: string | null;
  refundApprovedAt: string | null;
  refundCompletedAt: string | null;

  shippingAddress: ShippingAddress;

  items: OrderDetailsItem[];
  payments: OrderPaymentDetails[];

  disputes: unknown[];
  statusHistory: OrderStatusHistory[];

  seller: OrderSeller & {
    id: string;
  };
}

export type OrderDetailsResponse = ApiResponse<OrderDetails>;