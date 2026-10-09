export interface WishlistProduct {
  id: string;
  title: string;
  price: string;
  imageUrl: string;

  category: {
    id: string;
    name: string;
  };
}

export interface WishlistMeta {
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

export interface WishlistItem {
  id: string;
  type: "Items" | string;

  product: WishlistProduct;

  note: string | null;
  addedAt: string;
}

export interface WishlistResponse {
  success: boolean;
  message: string;
  meta: WishlistMeta;
  data: WishlistItem[];
}


// wishlist category

export interface WishlistCategoryResponse {
  success: boolean;
  message: string;
  meta: WishlistMeta;
  data: WishlistCategory[];
}

export interface WishlistMeta {
  timestamp: string;
  path: string;
  method: string;
}

export interface WishlistCategory {
  id: string;
  name: string;
  productCount: number;
  isPrivate?: boolean;
}


// wishlist collection

export interface WishlistCollectionsResponse {
  success: boolean;
  message: string;
  meta: WishlistMeta;
  data: WishlistCollection[];
}

export interface WishlistMeta {
  timestamp: string;
  path: string;
  method: string;
}

export interface WishlistCollection {
  id: string;
  userId: string;
  name: string;
  description: string;
  isPublic: boolean;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}