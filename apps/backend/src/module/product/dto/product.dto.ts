import { createZodDto } from 'nestjs-zod';
import { mediaUrlSchema } from '../../../../src/utils/media-url.util.js';
import z from 'zod';

const VariantOptionSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
  type: z.enum(['dropdown', 'color_picker']).default('dropdown'),
});

const ProductVariantSchema = z.object({
  mediaUrl: mediaUrlSchema.optional().nullable(),
  name: z.string().min(1),
  quantity: z.number().int().min(0).default(0),
  options: z.array(VariantOptionSchema).optional().nullable(),
  isActive: z.boolean().default(true),
});

const ProductCreateSchema = z.object({
  title: z.string(),
  subtitle: z.string().max(250).optional(),
  sellerId: z.string().optional(),
  price: z.number().positive(),
  description: z.string(),
  badge: z.string().optional(),
  discountType: z.enum(['none', 'percentage', 'fixed_amount']),
  discountValue: z.number().optional(),
  trackInventory: z.boolean().default(true),
  lowStockThreshold: z.number().int().min(0).default(5),
  categoryType: z.enum(['crafts', 'customization', 'commissions']),
  categoryId: z.string(),
  subCategoryId: z.string(),
  tags: z.array(z.string()).default([]),
  customizable: z.boolean().default(false),
  handmade: z.boolean().default(false),
  madeToOrder: z.boolean().default(false),
  processingTime: z.number().int().positive().optional(),
  variants: z.array(ProductVariantSchema).optional(),
});

const ProductDetailsUpdateSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().max(250).optional(),
  price: z.number().positive().optional(),
  description: z.string().optional(),
  badge: z.string().optional(),
  discountType: z.enum(['none', 'percentage', 'fixed_amount']).optional(),
  discountValue: z.number().optional(),
  trackInventory: z.boolean().optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  categoryType: z.enum(['crafts', 'customization', 'commissions']).optional(),
  categoryId: z.string().optional(),
  subCategoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  customizable: z.boolean().optional(),
  handmade: z.boolean().optional(),
  madeToOrder: z.boolean().optional(),
  processingTime: z.number().int().positive().optional(),
});

export class CreateProductDto extends createZodDto(ProductCreateSchema) {}
export class UpdateProductDetailsDto extends createZodDto(
  ProductDetailsUpdateSchema,
) {}
export class UpdateProductVariantDto extends createZodDto(
  ProductVariantSchema,
) {}
