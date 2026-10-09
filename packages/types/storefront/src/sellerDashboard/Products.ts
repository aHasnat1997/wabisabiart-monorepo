
// export interface VariantOption {
//   name: string;
//   value: string; // e.g. "Sky Blue,#81d4fa"
//   type: string;  // e.g. "color_picker"
//   quantity: number;
// }

// export interface Variant {
//   id: string;
//   productId: string;
//   mediaUrl: string;
//   name: string;
//   quantity: number;
//   options: VariantOption[];
//   isActive: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface Seller {
//   id: string;
//   email: string;
//   fullName: string;
//   avatarUrl: string;
// }

// export interface Product {
//   id: string;
//   sellerId: string;
//   title: string;
//   subtitle: string;
//   description: string;
//   price: string;
//   currency: string;
//   discountType: string;
//   discountValue: string;
//   trackInventory: boolean;
//   lowStockThreshold: number;
//   status: "active" | "draft" | "inactive" | "archived";
//   categoryType: string;
//   category: string;
//   subCategory: string;
//   isFeatured: boolean;
//   tags: string[];
//   customizable: boolean;
//   handmade: boolean;
//   madeToOrder: boolean;
//   processingTime: number;
//   favoriteCount: number;
//   salesCount: number;
//   averageRating: string;
//   createdAt: string;
//   updatedAt: string;
//   seller: Seller;
//   variants: Variant[];
// }




export interface VariantOption {
  name: string;
  value: string;
  type: string;
  quantity: number;
}

export interface Variant {
  id: string;
  mediaUrl: string;
  name: string;
  quantity: number;
  options: VariantOption[];
  isActive: boolean;
}

export interface Product {
  id: string;
  title: string;
  subCategory: string;
  lowStockThreshold: number;
  salesCount: number;
  totalQuantity: number;
  variants: Variant[];
}

export interface NewVariantForm {
  name: string;
  quantity: number;
  imageFile: File | null;
  imagePreview: string | null;
  selectedColors: string[];
  customColor: string;
}

export interface TableDataProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
}

// Raw API product type
export interface RawProduct {
  id: string;
  title: string;
  price: string;
  status: string;
  salesCount: number;
  totalQuantity: number;
  discountType: string;
  discountValue: string;
  seller: {
    email: string;
  };
  variants: {
    name: string;
    mediaUrl: string;
  }[];
}


export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  pendingReviewProducts: number;
  lowStockProducts: number;
}

