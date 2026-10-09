import { api } from './axios.js';

export interface PlatformFeeSetting {
  id: string;
  key: string;
  platformFeePercent: number;
  paymentProcessingPercent: number;
  paymentProcessingFlat: number;
  sellerKeepsPercent: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePlatformFeePayload {
  platformFeePercent?: number;
  paymentProcessingPercent?: number;
  paymentProcessingFlat?: number;
  notes?: string;
}

export const billingFeesAdminApi = {
  getConfig: () =>
    api.get<{ data: PlatformFeeSetting }>(
      '/seller-settings/admin/billing-fees',
    ),
  updateConfig: (payload: UpdatePlatformFeePayload) =>
    api.patch<{ data: PlatformFeeSetting }>(
      '/seller-settings/admin/billing-fees',
      payload,
    ),
};
