"use server";

import { apiFetch } from "@/lib/apiFetch";
import { CategoryDetailsResponse, CategoryResponse } from "@/types/category";

export const getAllCategories = async () => {
  try {
    const res = await apiFetch<CategoryResponse>("/category");
    return res?.data;
  } catch (error) {
    console.error("Fetch categories error:", error);
    throw error;
  }
};

export const getCategoryDetails = async (categoryId: string) => {
  try {
    const res = await apiFetch<CategoryDetailsResponse>(
      `/category/${categoryId}`,
    );
    return res?.data;
  } catch (error) {
    console.error("Fetch category details error:", error);
    throw error;
  }
};

export const giveReview = async ({
  productId,
  rating,
  comment,
  images,
}: {
  productId: string;
  rating: number;
  comment: string;
  images: string[];
}) => {
  try {
    const res = await apiFetch<{ success: boolean; message: string }>(
      "/review",
      {
        method: "POST",
        body: { productId, rating, comment, images },
      },
    );
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const reportProduct = async (payload: {
  productId: string;
  reason: string;
  description: string;
}) => {
  try {
    const res = await apiFetch<{ success: boolean; message: string }>(
      `/reports`,
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
};