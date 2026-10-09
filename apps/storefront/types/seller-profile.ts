// shop.types.ts

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  meta: {
    timestamp: string;
    path: string;
    method: string;
  };
  data: T;
}

/* ================= SHOP ================= */

export interface Shop {
  id: string;
  shopName: string;
  shopDescription: string;

  shopAnnouncement: string | null;
  shopBannerImage: string;
  shopLogo: string;

  address: string;

  shopPolicies: string | null;
  returnPolicy: string | null;
  privacyPolicy: string | null;
  shippingPolicy: string | null;

  totalSales: number;
  totalReviews: number;
  averageRating: string;

  facebookUrl: string | null;
  instagramUrl: string | null;
  twitterUrl: string | null;
  websiteUrl: string | null;

  createdAt: string;

  user: ShopUser;

  followers: unknown[];
  announcements: unknown[];
  shopJournals: ShopJournal[];
  products: ShopProduct[];
}

/* ================= USER ================= */

export interface ShopUser {
  id: string;
  fullName: string;
  avatarUrl: string;
}

/* ================= JOURNAL ================= */

export interface ShopJournal {
  id: string;
  title: string;
  bannerImage: string;
  shortExcerpt: string;
  content: string;
  createdAt: string;
}

/* ================= PRODUCTS ================= */

export interface ShopProduct {
  id: string;
  title: string;
  subtitle: string;
  description: string;

  price: string;
  discountType?:
    | "fixed_amount"
    | "percentage"
    | "percentage"
    | "fixed"
    | "none"
    | null;
  discountValue?: string | null;

  badge?: string;
  averageRating?: string;

  salesCount?: number;
  favoriteCount?: number;

  isFeatured?: boolean;

  createdAt?: string;

  variants: ProductVariant[];

  isWishlist?: boolean;
  finalPrice?: string;
}

/* ================= VARIANT ================= */

export interface ProductVariant {
  id: string;
  name: string;
  mediaUrl: string;
  quantity: number;

  options: VariantOption[];
}

export interface VariantOption {
  name: string;
  value: string;
  type: string;
}

/* ================= FINAL RESPONSE ================= */

export type ShopResponse = ApiResponse<Shop>;
