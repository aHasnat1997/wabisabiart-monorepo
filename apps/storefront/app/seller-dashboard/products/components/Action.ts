"use server";

import { apiFetch } from "@/lib/apiFetch";
import {  revalidateProducts } from "./ServerAction";
import { ProductFormValues } from "./ProductSchema";
import { ProductDetail } from "@/types/productDetails";
import { Product, ProductStats, RawProduct, Variant } from "@/types/sellerDashboard/Products";



export interface Category {
  id: string;
  name: string;
  type: string;
}

export interface SubCategory {
  id: string;
  name: string;
}

// API Actions for products create

export const createProduct = async (payload: object) => {
  try {
    const data = await apiFetch<{ success: boolean }>("/product", {
      method: "POST",
      body: payload,
    });
    await revalidateProducts();
    return data;
  } catch (error) {
    console.error("Create product error:", error);
    throw error;
  }
};

// API Actions for product details

export const getProductById = async (productId: string) => {
  try {
    const data = await apiFetch<{ success: boolean; data: ProductDetail }>(
      `/product/${productId}`,
      { method: "GET" }
    );
    return data;
  } catch (error) {
    console.error("Failed to fetch product", error);
    throw error;
  }
};

// API Actions for products update

export const updateProduct = async (
  productId: string,
  payload: Partial<ProductFormValues>
) => {
  try {
    const data = await apiFetch<{ success: boolean; data: Product }>(
      `/product/${productId}`,
      { method: "PATCH", body: payload }
    );
    await revalidateProducts();
    return data;
  } catch (error) {
    console.error("Update product error:", error);
    throw error;
  }
};

// API Actions for products delete

export const deleteProduct = async (productId: string) => {
  try {
    const data = await apiFetch<{ success: boolean }>(
      `/product/${productId}`,
      { method: "DELETE" }
    );
    await revalidateProducts();
    return data;
  } catch (error) {
    console.error("Delete product error:", error);
    throw error;
  }
};

// API Actions for inventory management Update stock 


export const refillStock = async (variantId: string, quantity: number) => {
  try {
    const data = await apiFetch<{ success: boolean }>(
      `/product/refill-stock/${variantId}`,
      { method: "PATCH", body: { quantity } }
    );
    return data;
  } catch (error) {
    console.error("Refill stock error:", error);
    throw error;
  }
};

// API Actions for inventory management variant add

export const addVariant = async (productId: string, payload: object) => {
  try {
    const data = await apiFetch<{ success: boolean; data: Variant }>(
      `/product/variant/${productId}`,
      { method: "POST", body: payload }
    );
    return data;
  } catch (error) {
    console.error("Add variant error:", error);
    throw error;
  }
};

// API Actions for inventory management variant remove

export const removeVariant = async (variantId: string) => {
  try {
    const data = await apiFetch(`/product/variant/${variantId}`, { method: "DELETE" });
    await revalidateProducts();
    return data;
  } catch (error) {
    console.error("Delete product error:", error);
    throw error;
  }
};

// API Actions for categories 

export const getAllCategories = async () => {
  try {
    const data = await apiFetch<{ success: boolean; data: Category[] }>(
      "/category",
      { method: "GET" }
    );
    return data.data ?? [];
  } catch (error) {
    console.error("Failed to fetch categories", error);
    throw error;
  }
};

// API Actions for subcategories

export const getSubCategoriesByCategoryId = async (categoryId: string) => {
  try {
    const data = await apiFetch<{
      success: boolean;
      data: { subCategories: SubCategory[] };
    }>(`/category/${categoryId}`, { method: "GET" });
    return data.data?.subCategories ?? [];
  } catch (error) {
    console.error("Failed to fetch subcategories", error);
    throw error;
  }
};


export async function getProductsMyListing(
  page: number = 1,
  limit: number = 10,
  status: string = ""
): Promise<{ products: RawProduct[]; total: number; totalPages: number }> {
  try {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status) query.set("status", status); 

    const data = await apiFetch<{
      data: RawProduct[];
      meta: { totalData: number; totalPages: number };
    }>(`/product/my-products?${query.toString()}`, {
      method: "GET",
    });

    return {
      products: data?.data ?? [],
      total: data?.meta?.totalData ?? 0,
      totalPages: data?.meta?.totalPages ?? 1,
    };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { products: [], total: 0, totalPages: 1 };
  }
}


// API Actions for inventory page products fetch

export const getProductsInventory = async (
  page: number = 1,
  limit: number = 10
): Promise<{ products: Product[]; total: number; totalPages: number }> => {
  try {
    const data = await apiFetch<{
      data: Product[];
      meta: { totalData: number; totalPages: number };
    }>(`/product/my-products?page=${page}&limit=${limit}`, {
      method: "GET",
    });

    return {
      products: data?.data ?? [],
      total: data?.meta?.totalData ?? 0,
      totalPages: data?.meta?.totalPages ?? 1,
    };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { products: [], total: 0, totalPages: 1 };
  }
};

// API Actions for all products stats

export const getAllProductsForStats = async (): Promise<Product[]> => {
  try {
    const data = await apiFetch<{ data: Product[] }>(
      "/product/my-products?limit=1000",
      { method: "GET" }
    );
    return data?.data ?? [];
  } catch (error) {
    console.error("Failed to fetch all products for stats:", error);
    return [];
  }
};


export const getProductStats = async (): Promise<ProductStats> => {
  try {
    

    const data = await apiFetch<{ success: boolean; data: ProductStats }>(
      "/product/my-listing-status",
      { method: "GET" }
    );
    
    return data.data
  } catch (error) {
    console.error("Error fetching product stats:", error);
    throw error;
  }
};