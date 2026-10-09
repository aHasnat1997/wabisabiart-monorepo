
import * as z from "zod";

export const couponSchema = z.object({
  code: z.string()
  .min(1, "Coupon code is required")
  .regex(/^[A-Z0-9]+$/, "Coupon code must contain only uppercase letters and numbers"),
  discountType: z.enum(["percentage", "fixed", "free_shipping"]),
  discountValue: z.number().min(0, "Discount must be at least 0"),
  maxUses: z.number().min(0, "Max uses must be at least 0"),
  expiresAt: z.string().min(1, "Expiration date is required"),
  minPurchase: z.number().min(0, "Min purchase must be at least 0"),
  customerRestriction: z.enum(["New Customer", "All Customer", "VIP Customer", "Returning Customer"]),
  onePerCustomer: z.boolean().default(false).optional(),
});

export type CouponFormValues = z.infer<typeof couponSchema>;
