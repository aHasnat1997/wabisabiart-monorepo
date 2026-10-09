import { api } from './axios.js';

export interface Product {
  id: string;
  sellerId: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  price: string; // Keeping as string to match your JSON "1500"
  currency: string;
  discountType: 'percentage' | 'fixed_amount'; // Adjusted based on common patterns
  discountValue: string;
  trackInventory: boolean;
  lowStockThreshold: number;
  status:
    | 'draft'
    | 'pending_review'
    | 'active'
    | 'inactive'
    | 'out_of_stock'
    | 'rejected';
  categoryType: string;
  categoryId: string;
  subCategoryId: string;
  category: {
    id: string;
    name: string;
    type: string;
    description: string;
  };
  subCategory: { id: string; name: string; description: string };
  isFeatured: boolean;
  tags: string[];
  customizable: boolean;
  handmade: boolean;
  madeToOrder: boolean;
  processingTime: number;
  favoriteCount: number;
  salesCount: number;
  averageRating: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  seller: Seller;
  variants: Variant[];
  finalPrice: string;
  totalQuantity: number;
}

export interface Seller {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
}

export interface Variant {
  id: string;
  productId: string;
  mediaUrl: string;
  name: string;
  quantity: number;
  options: VariantOption[];
  isLowStock: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VariantOption {
  name: string;
  value: string;
  type: 'color_picker' | 'dropdown';
}

export const productApi = {
  getAll: () => api.get<{ data: Product[] }>('/product'),
  getOne: (id: string) => api.get<{ data: Product }>(`/product/${id}`),
  getAllDraft: () => api.get<{ data: Product[] }>('/product/pending_review'),
  approveOrReject: (id: string, action: 'approved' | 'rejected') =>
    api.patch<{ data: Product }>(`/product/status/${id}`, {
      status: action === 'approved' ? 'active' : 'rejected',
    }),
};
