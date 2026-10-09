"use server";

import { revalidatePath } from "next/cache";

export async function revalidateInsights() {
  revalidatePath("/seller-dashboard/insights");
}