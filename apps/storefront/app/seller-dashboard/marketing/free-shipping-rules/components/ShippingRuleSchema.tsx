import * as z from "zod";

export const shippingRuleSchema = z.object({
  name: z.string().min(1, "Rule name is required"),
  minOrderAmount: z
    .number()
    .min(1, "Minimum order amount must be greater than 0"),
  region: z.enum([
    "All Countries",
    "United States",
    "International",
    "Asia",
    "Europe",
  ]),
});

export type ShippingRuleFormValues = z.infer<
  typeof shippingRuleSchema
>;
