import * as z from "zod";

// ─── FORM 2: Steps 5–10 (Shop setup) ─────────────────────────────────────────

export const shopFormSchema = z.object({
  agreeToSellerAgreement: z.boolean().optional(),
  shopName: z.string().optional(),
  countryCity: z.string().optional(),
  craftDescription: z
    .string()
    .max(500, { message: "Description must be less than 500 characters" })
    .optional(),
  handcraftedItems: z.boolean().optional(),
  enable2FA: z.boolean().optional(),
});

export type ShopFormValues = z.infer<typeof shopFormSchema>;

export const step5Schema = z.object({
  agreeToSellerAgreement: z.boolean().refine((val) => val === true, {
    message: "You must agree to the seller agreement",
  }),
});

export const step6Schema = z.object({
  shopName: z.string().min(2, { message: "Shop name is required" }),
  countryCity: z.string().min(2, { message: "Country/city is required" }),
  craftDescription: z
    .string()
    .max(500, { message: "Description must be less than 500 characters" })
    .optional(),
  handcraftedItems: z.boolean().optional(),
});
