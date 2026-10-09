// ===============================
// Common Types
// ===============================

import { Product } from "./product";

export interface ApiMeta {
  timestamp: string;
  path: string;
  method: string;
}

export type CategoryType = "customization" | "crafts" | "commissions"; // change to `string` if dynamic

// ===============================
// Category List Types
// ===============================

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryResponse {
  success: boolean;
  message: string;
  meta: ApiMeta;
  data: Category[];
}

// ===============================
// Category Details Types
// ===============================

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
  imageUrl: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryDetails extends Category {
  subCategories: SubCategory[];
}

export interface CategoryDetailsResponse {
  success: boolean;
  message: string;
  meta: ApiMeta;
  data: CategoryDetails;
}

// ===============================
// Featured Categories Types
// ===============================
export interface FeaturedCategoriesResponse {
  success: boolean;
  message: string;
  meta: Meta;
  data: FeaturedCategory[];
}

export interface Meta {
  timestamp: string;
  path: string;
  method: string;
}

export interface FeaturedCategory {
  id: string;
  name: string;
  type: string;
  description: string;
  isFeatured: boolean;
  products: Product[];
  latestVariantImage?: string | null;
}