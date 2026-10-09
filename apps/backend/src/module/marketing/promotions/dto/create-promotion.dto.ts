import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const CreatePromotionSchema = z.object({
  name: z.string().min(1),
  discountType: z.enum(['PERCENTAGE', 'FIXED', 'BOGO']),
  discountValue: z.number().min(0),
  applyTo: z.enum(['ALL_PRODUCTS', 'BY_CATEGORY', 'SPECIFIC_PRODUCTS']),
  categoryIds: z.array(z.string()).optional(),
  productIds: z.array(z.string()).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  minimumPurchase: z.number().min(0).optional(),
  usageLimit: z.number().int().min(1).optional(),
  onePerCustomer: z.boolean().optional(),
});

export class CreatePromotionDto extends createZodDto(CreatePromotionSchema) {}
