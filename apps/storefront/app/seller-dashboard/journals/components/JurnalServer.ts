"use server"

import { revalidatePath } from "next/cache";

export const revalidateJournals = async () => {
  revalidatePath("/seller/journals");
};