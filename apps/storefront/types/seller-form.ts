// Craft categories constant
export const craftCategories = [
  "Jewelry & Accessories",
  "Home & Living",
  "Art & Collectibles",
  "Clothing & Shoes",
  "Paper & Party Supplies",
  "Wedding & Bridal",
  "Toys & Games",
  "Bath & Beauty",
  "Pet Supplies",
  "Craft Supplies & Tools",
  "Vintage",
  "Other",
] as const;

export interface FeaturedShopsResponse {
  success: boolean;
  message: string;
  meta: Meta;
  data: FeaturedShop[];
}

export interface Meta {
  timestamp: string;
  path: string;
  method: string;
}

export interface FeaturedShop {
  id: string;
  userId: string;
  shopName: string;
  shopDescription: string;
  address: string;
  shopLogo: string;
  shopBannerImage: string;
  totalSales: number;
  totalReviews: number;
  averageRating: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  user: ShopOwner;
}

export interface ShopOwner {
  id: string;
  fullName: string;
  avatarUrl: string;
}