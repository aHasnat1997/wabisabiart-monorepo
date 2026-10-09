

export interface VariantOption {
  name: string;
  value: string;
  type: string;
}

export interface ProductVariant {
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

export interface SellerProfile {
  id: string;
  shopName: string;
  shopLogo: string;
  shopDescription: string;
  address: string;
  totalSales: number;
  totalReviews: number;
  averageRating: string;
}

export interface ProductSeller {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  sellerProfile: SellerProfile;
}

export interface ProductDetail {
  id: string;
  sellerId: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string | null;
  price: string;
  currency: string;
  discountType: "fixed_amount" | "percentage" | "none";
  discountValue: string;
  trackInventory: boolean;
  lowStockThreshold: number;
  status: string;
  categoryType: string;
  category: string;
  subCategory: string;
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
  variants: ProductVariant[];
  seller: ProductSeller;
  finalPrice?: string;
  totalQuantity?: number;
  isWishlist: boolean;
}

export interface ProductDetailResponse {
  success: boolean;
  message: string;
  meta: {
    timestamp: string;
    path: string;
    method: string;
  };
  data: ProductDetail;
}