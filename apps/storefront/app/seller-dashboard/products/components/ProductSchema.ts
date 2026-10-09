import { z } from "zod";

/* ================================
   Variant Option Schema
================================ */
const variantOptionSchema = z.object({
  name: z.string().min(1, "Option name is required"),
  value: z.string().min(1, "Option value is required"),
  type: z.enum(["dropdown", "color_picker"]),
  quantity: z.number().min(0).optional(),
});

const variantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  quantity: z.number().min(0, "Variant quantity cannot be negative"),
  mediaUrl: z.string().optional(),
  isActive: z.boolean(),
  options: z
    .array(variantOptionSchema)
    .min(1, "At least one option is required"),
});
/* ================================
   Custom Field Schema
================================ */
const customFieldSchema = z.object({
  title: z.string().min(1, "Custom field title is required"),
  type: z.enum(["Text Input", "Dropdown", "Color Picker"]),
  options: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  value: z.string().optional(),
  customColor: z.string().optional(),
});

/* ================================
   Product Schema
================================ */
export const productSchema = z.object({
  /* -------- Step 1 -------- */
  title: z.string().min(3, "Title must be at least 3 characters"),
  subtitle: z.string().max(250, "Subtitle must be at most 250 characters"),
  badge: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryType: z.enum(["crafts", "customization", "commissions"]),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().min(1, "Sub category is required"),
  price: z.number().min(0, "Price must be 0 or greater"),
  name: z.string().optional(),
  stock: z.number().min(0, "Stock cannot be negative").optional(),
  tags: z.array(z.string()).optional(),
  customizable: z.boolean().optional(),
  handmade: z.boolean().optional(),
  madeToOrder: z.boolean().optional(),
  processingTime: z
    .number()
    .min(0, "Processing time cannot be negative")
    .optional(),
  images: z.array(z.string()).optional(),

  /* -------- Step 2 -------- */
  variants: z.array(variantSchema).optional(),
  customFields: z.array(customFieldSchema).optional(),

  /* -------- Step 3 -------- */
  discountType: z.enum(["none", "percentage", "fixed_amount"]),
  discountValue: z.number().min(0, "Discount cannot be negative").optional(),
  trackInventory: z.boolean().optional(),
  lowStockThreshold: z
    .number()
    .min(0, "Low stock threshold cannot be negative")
    .optional(),
  scheduleCall: z.boolean().optional(),
  callDate: z.string().optional(),
  callTime: z.string().optional(),
  callNote: z.string().optional(),
});

/* ================================
   Types
================================ */
export type ProductFormValues = z.infer<typeof productSchema>;
export type CustomField = NonNullable<
  ProductFormValues["customFields"]
>[number];
export type Variant = NonNullable<ProductFormValues["variants"]>[number];
export type VariantOption = z.infer<typeof variantOptionSchema>;
