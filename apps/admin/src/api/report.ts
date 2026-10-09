import { api } from './axios.js';

export type TReportStatus = 'pending' | 'approved' | 'rejected';
export type TReportReason = 'spam' | 'counterfeit' | 'inappropriate' | 'misleading' | 'other';

export type TReport = {
  id: string;
  productId: string;
  reason: TReportReason;
  description?: string;
  status: TReportStatus;
  resolution?: string;
  reviewedAt?: string;
  createdAt: string;
  reporter: { id: string; fullName: string; email: string };
  reportedUser?: {
    id: string;
    fullName: string;
    email: string;
    sellerProfile?: { id: string; shopName: string };
  };
};

export const ReportsApi = {
  list: () => api.get<{ data: TReport[] }>('/reports/admin'),
  get: (id: string) => api.get<{ data: TReport }>(`/reports/admin/${id}`),
  approve: (id: string, resolution?: string) =>
    api.patch(`/reports/admin/${id}/approve`, { resolution }),
  reject: (id: string) => api.patch(`/reports/admin/${id}/reject`),
  forceProductInactive: (productId: string) =>
    api.patch(`/reports/admin/product/${productId}/inactive`),
  freezeShop: (shopId: string) =>
    api.patch(`/reports/admin/shop/${shopId}/freeze`),
  unfreezeShop: (shopId: string) =>
    api.patch(`/reports/admin/shop/${shopId}/unfreeze`),
};
