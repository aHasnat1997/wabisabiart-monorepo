import z from "zod";

export const promotionSchema = z.object({
  name: z.string().min(1, "Campaign Name is required"),
  // 👇 Tomar ager sothik format tai rakhlam
  discountType: z.enum(["PERCENTAGE", "FIXED", "BOGO"], {
    error: "Select a discount type",
  }),
  // 👇 Base validation ke optional kora holo
  discountValue: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().or(z.literal("")),
  minAmount: z.number().min(0).optional(),
  useLimit: z.number().min(0).optional(),
  onePerCustomer: z.boolean(),
  applyTo: z.enum(["ALL_PRODUCTS", "BY_CATEGORY", "SPECIFIC_PRODUCTS"]),  
  categoryIds: z.array(z.string()).optional(),
  productIds: z.array(z.string()).optional(),
})
// 👇 Ekhane check korlam jate BOGO hole discountValue na lagle o form pass kore
.refine((data) => {
  if (data.discountType !== "BOGO") {
    // PERCENTAGE ba FIXED hole oboshhoi value lagbe
    return !!data.discountValue && data.discountValue.trim().length > 0;
  }
  // BOGO hole value charai pass korbe
  return true;
}, {
  message: "Discount value is required",
  path: ["discountValue"], 
});

export type PromotionFormValues = z.infer<typeof promotionSchema>;