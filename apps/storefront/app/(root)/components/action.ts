"use server";

import { apiFetch } from "@/lib/apiFetch";
import { FeaturedCategoriesResponse } from "@/types/category";
import { SupportContactResponse } from "@/types/contact";
import { ProductsResponse } from "@/types/product";
import { ProductDetailResponse } from "@/types/productDetails";
import { ReviewsResponse } from "@/types/reviews";
import { FeaturedShopsResponse } from "@/types/seller-form";
import { ShopResponse } from "@/types/seller-profile";
import { revalidatePath } from "next/cache";

export async function getAllProduct(query: string) {
  try {
    const data = await apiFetch<ProductsResponse>(`/product?${query}`);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getProductById(id: string) {
  try {
    const data = await apiFetch<ProductDetailResponse>(`/product/${id}`);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function addToCart({
  productId,
  variantId,
  quantity,
}: {
  productId: string;
  variantId: string;
  quantity: number;
}) {
  try {
    const data = await apiFetch<{ success: boolean; message: string }>(
      `/cart`,
      { method: "POST", body: { productId, variantId, quantity } },
    );
    return data;
  } catch (error) {
    console.error("Failed to fetch product", error);
    throw error;
  }
}

export async function getFeaturedCategories() {
  try {
    const res =
      await apiFetch<FeaturedCategoriesResponse>(`/category/featured`);
    return res?.data;
  } catch (error) {
    console.error("Failed to fetch featured categories", error);
    throw error;
  }
}

export async function getGiftCategories() {
  try {
    const res = await apiFetch<FeaturedCategoriesResponse>(
      `/category/good-for-gift`,
    );
    return res?.data;
  } catch (error) {
    console.error("Failed to fetch gift categories", error);
    throw error;
  }
}

export async function getBestDeals(query?: string) {
  try {
    const url = query ? `/product/best-deals?${query}` : `/product/best-deals`;
    const data = await apiFetch<ProductsResponse>(url);
    return data;
  } catch (error) {
    console.error("Failed to fetch best deals", error);
    throw error;
  }
}

export async function getFeaturedStory() {
  try {
    const res = await apiFetch<FeaturedShopsResponse>(`/user/shops/featured`);
    return res?.data;
  } catch (error) {
    console.error("Failed to fetch best sellers", error);
    throw error;
  }
}

export async function addToWishList(productId: string) {
  try {
    const res = await apiFetch<{ success: boolean; message: string }>(
      "/wishlist/item",
      {
        method: "POST",
        body: { productId },
      },
    );
    revalidatePath("/products");
    return res;
  } catch (error: unknown) {
    console.error(
      error instanceof Error ? error.message : "Failed to add to wishlist",
      error,
    );
    throw error;
  }
}


// get seller details by id
export async function getSellerDetails(shopId: string) {
  try {
    const res = await apiFetch<ShopResponse>(`/user/shops/${shopId}/public`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch seller details", error);
    throw error;
  }
}


// get product reviews by product id
export async function getProductReviews(productId: string) {
  try {
    const res = await apiFetch<ReviewsResponse>(
      `/review/${productId}`,
    );
    return res.data;
  } catch (error) {
    console.error("Failed to fetch product reviews", error);
    throw error;
  }
}


// contact admin

export const adminContactInfo = async() => {
  try {
    const res = await apiFetch<SupportContactResponse>(
      `/support/contacts`,
    );
    return res.data;
  } catch (error) {
    console.error("Failed to fetch contact info", error);
    throw error;
  }
}
 
export async function contactSeller(payload: {
  firstName: string
  lastName: string,
  email: string,
  subject: string,
  message: string
}) {
try{
  const res = await apiFetch<{ success: boolean; message: string }>(
    `/support/email`,
    {
      method: "POST",
      body: payload,
    },
  );
  return res;
} catch (error) {
  console.error(error);
  throw error;
}
}