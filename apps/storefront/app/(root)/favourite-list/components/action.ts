"use server";

import { apiFetch } from "@/lib/apiFetch";
import {
  WishlistCategoryResponse,
  WishlistCollectionsResponse,
  WishlistResponse,
} from "@/types/wishlist";
import { id } from "date-fns/locale";
import { revalidatePath } from "next/cache";

export const getWishlistProducts = async (resolvedParams: string) => {
  try {
    const res = await apiFetch<WishlistResponse>(
      `/wishlist/items?${resolvedParams}`,
    );
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getCollections = async () => {
  try {
    const res = await apiFetch<WishlistCollectionsResponse>(
      "/wishlist/collections",
    );
    return res?.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const res = await apiFetch<WishlistCategoryResponse>(
      "/wishlist/categories",
    );
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createCollection = async (name: string, isPublic: boolean) => {
  try {
    const res = await apiFetch<{ success: true; message: string }>(
      "/wishlist/collection",
      {
        method: "POST",
        body: { name, isPublic },
      },
    );
    revalidatePath("/favourite-list");
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateCollection = async (
  id: string,
  name: string,
  isPublic: boolean,
) => {
  try {
    const res = await apiFetch<{ success: true; message: string }>(
      `/wishlist/collection/${id}`,
      {
        method: "PATCH",
        body: { name, isPublic },
      },
    );
    revalidatePath("/favourite-list");
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const removeFromWishlist = async (id: string) => {
  try {
    const res = await apiFetch<{ success: true; message: string }>(
      `/wishlist/item/${id}`,
      {
        method: "DELETE",
      },
    );
    revalidatePath("/favourite-list");
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const moveToCollection = async (itemId: string, wishlistId: string) => {
  try {
    const res = await apiFetch<{ success: true; message: string }>(
      `/wishlist/item/${itemId}`,
      {
        method: "PUT",
        body: { wishlistId },
      },
    );
    revalidatePath("/favourite-list");
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteCollection = async (id: string) => {
  try {
    const res = await apiFetch<{ success: true; message: string }>(
      `/wishlist/collection/${id}`,
      {
        method: "DELETE",
      },
    );
    revalidatePath("/favourite-list");
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};