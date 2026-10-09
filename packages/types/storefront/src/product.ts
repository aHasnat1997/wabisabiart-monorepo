// types/product.ts

export interface ApiMeta {
  timestamp: string;
  path: string;
  method: string;
  page: number;
  limit: number;
  totalData: number;
  totalPages: number;
  isNextPage: boolean;
  isPreviousPage: boolean;
}

export interface Seller {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
}

export type VariantOptionType = "color_picker" | "dropdown" | string;

export interface VariantOption {
  name: string;
  value: string;
  type: VariantOptionType;
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

export type DiscountType = "percentage" | "fixed" | "none";

export type ProductStatus = "active" | "draft" | "archived" | string;

export type CategoryType = "commissions" | "crafts" | string;

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  description: string;
  promotionId: string | null;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  sellerId?: string;

  title: string;
  subtitle: string;
  description: string;

  badge?: string | null;

  price: string;
  currency?: string;

  discountType?: DiscountType;
  discountValue?: string;

  trackInventory?: boolean;
  lowStockThreshold?: number;

  status?: ProductStatus;

  categoryType?: CategoryType;

  categoryId?: string;
  subCategoryId?: string;

  promotionId?: string | null;

  isFeatured?: boolean;

  tags?: string[];

  customizable?: boolean;
  handmade?: boolean;
  madeToOrder?: boolean;

  processingTime?: number;

  favoriteCount?: number;
  salesCount?: number;
  averageRating?: string;

  deletedAt?: string | null;

  createdAt?: string;
  updatedAt?: string;

  seller?: Seller;

  variants?: Variant[];

  category?: Category;
  subCategory?: SubCategory;

  finalPrice?: string;
  totalQuantity?: number;
  isWishlist?: boolean;
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  meta: ApiMeta;
  data: Product[];
}

export interface CardType {
  id: string;
  name: string;

  category: string;

  variantId: string | null;

  price: number | string;
  originalPrice?: number | string | null;

  image: string[];

  quantity: number;

  ratings: number;

  isMultiple: boolean;
  isCustomize: boolean;

  badge?: string | null;

  shipping: string;
  estDelivery: string;
  isReturn: boolean;
}