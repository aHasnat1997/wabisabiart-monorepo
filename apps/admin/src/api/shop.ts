import { api } from './axios.js';

export type ShopApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface AdminShopRequest {
  id: string;
  shopName: string;
  shopDescription?: string;
  address?: string;
  shopLogo?: string;
  shopBannerImage?: string;
  proofOfIdentity?: string;
  sampleProducts: string[];
  isAgreedToTermsAndConditions: boolean;
  isHandcraftedOrEthicallySourced: boolean;
  status: ShopApprovalStatus;
  reviewNote?: string;
  reviewedAt?: string;
  reviewedByAdminId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSellerProfile {
  id: string;
  shopName: string;
  shopDescription?: string;
  address?: string;
  shopLogo?: string;
  shopBannerImage?: string;
  proofOfIdentity?: string;
  sampleProducts: string[];
  isVerified: boolean;
  isFeatured: boolean;
  isVerifiedByAdmin?: boolean;
  verificationDate?: string;
  createdAt: string;
}

export interface AdminShopRecord {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: string;
  sellerProfile?: AdminSellerProfile | null;
  shopSetupRequest?: AdminShopRequest | null;
}

export const shopAdminApi = {
  getAll: () => api.get<{ data: AdminShopRecord[] }>('/user/admin/shops'),
  getOne: (sellerId: string) =>
    api.get<{ data: AdminShopRecord }>(`/user/admin/shops/${sellerId}`),
  approve: (sellerId: string) =>
    api.patch<{ data: AdminShopRecord }>(
      `/user/admin/shops/${sellerId}/approve`,
    ),
  setFeatured: (sellerId: string, isFeatured: boolean) =>
    api.patch<{ data: AdminShopRecord }>(
      `/user/admin/shops/${sellerId}/featured`,
      {
        isFeatured,
      },
    ),
  reject: (sellerId: string, reason?: string) =>
    api.patch<{ data: AdminShopRecord }>(
      `/user/admin/shops/${sellerId}/reject`,
      {
        reason,
      },
    ),
};
