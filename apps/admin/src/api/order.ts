import { api } from './axios.js';

export interface AdminOrderItem {
  id?: string;
  productTitle: string;
  variantName?: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  sku?: string;
}

export interface AdminOrderSummaryRow {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: string;
  currency: string;
  internalNote?: string;
  stripeChargeId?: string | null;
  stripePaymentIntentId?: string | null;
  buyerNote?: string;
  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  buyer: { id: string; fullName: string; email: string; avatarUrl?: string };
  seller: { id: string; shopName: string; shopLogo?: string };
  items: AdminOrderItem[];
  payments?: {
    status: string;
    amount: string;
    processedAt?: string;
    provider?: string;
  }[];
  shipments?: { status: string; carrier?: string; trackingNumber?: string }[];
  refunds?: { status: string; amount: string; requestedAt: string }[];
  disputes?: { status: string; reason: string; openedAt: string }[];
}

export interface AdminOrderDetail extends AdminOrderSummaryRow {
  subtotal: string;
  shippingCost: string;
  taxAmount: string;
  discountAmount: string;
  tipAmount: string;
  couponCode?: string;
  sellerNote?: string;
  seller: {
    id: string;
    shopName: string;
    shopLogo?: string;
    address?: string;
  };
  buyer: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    phoneNumber?: string;
  };
  shippingAddress?: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    stateProvince?: string;
    postalCode: string;
    country: string;
    phoneNumber?: string;
  };
  statusHistory: {
    id: string;
    status: string;
    note?: string;
    createdAt: string;
  }[];
  disputes: {
    id: string;
    status: string;
    reason: string;
    description: string;
    openedAt: string;
    resolution?: string;
    resolvedAt?: string;
    messages: {
      id: string;
      senderId: string;
      message: string;
      createdAt: string;
    }[];
  }[];
  refunds: {
    id: string;
    amount: string;
    reason: string;
    status: string;
    requestedAt: string;
    processedAt?: string;
  }[];
  shipments: {
    id: string;
    status: string;
    carrier: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDeliveryDate?: string;
    shippedAt?: string;
  }[];
}

export interface SellerPayoutApprovalResult {
  message: string;
  orderId: string;
}

export interface AdminOrderListData {
  meta: { page: number; limit: number; total: number; totalPage: number };
  data: AdminOrderSummaryRow[];
}

export interface SellerOrderSummary {
  totalOrders: number;
  pendingShipment: number;
  cancelledOrders: number;
  totalRevenue: string;
}

export const orderAdminApi = {
  getAll: (params?: Record<string, string>) =>
    api.get<{ data: AdminOrderListData }>('/orders/admin', { params }),
  getPendingPayouts: () =>
    api.get<{ data: AdminOrderSummaryRow[] }>('/orders/admin/payouts/pending'),
  getOne: (id: string) =>
    api.get<{ data: AdminOrderDetail }>(`/orders/admin/${id}`),
  releasePayout: (id: string) =>
    api.post<{ data: SellerPayoutApprovalResult }>(
      `/orders/admin/${id}/release-payout`,
    ),
  approveCancelRequest: (id: string) =>
    api.patch<{ data: unknown }>(`/orders/admin/${id}/approve-cancel`),
  rejectCancelRequest: (id: string, reason: string) =>
    api.patch<{ data: unknown }>(`/orders/admin/${id}/reject-cancel`, {
      reason,
    }),
  resolveDispute: (id: string, resolution: string, outcome: string) =>
    api.patch<{ data: unknown }>(`/orders/admin/${id}/resolve-dispute`, {
      resolution,
      outcome,
    }),
};

export const sellerOrderApi = {
  getSummary: () =>
    api.get<{ data: SellerOrderSummary }>('/orders/seller/order-summary'),
};

export const orderAdminSellerApi = {
  getSellerOrderSummary: (sellerId: string) =>
    api.get<{ data: SellerOrderSummary }>(
      `/orders/admin/seller/${sellerId}/order-summary`,
    ),
};
