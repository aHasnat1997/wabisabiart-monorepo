import { z } from "zod";

export const shopifySchema = z.object({
  storeUrl: z
    .string()
    .min(5, "Store URL is required"),

  apiKey: z
    .string()
    .min(10, "API key is required"),
});

export const etsySchema = z.object({
  shopName: z.string().min(5, "Shop name is required"),
  apiKey: z.string().min(10, "API key is required"),
});

export const customSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size < 50 * 1024 * 1024, "Max file size 50MB"),
});
