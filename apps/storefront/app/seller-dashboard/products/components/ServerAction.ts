"use server";

import { revalidatePath } from "next/cache";

export async function revalidateProducts() {
  revalidatePath("/seller-dashboard/products");
}







