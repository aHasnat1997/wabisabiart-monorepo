import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const UpdatePromotionSchema = z.object({
  discountType: z.enum(['PERCENTAGE', 'FIXED', 'BOGO']),
  discountValue: z.number().min(0).optional(),
  usageLimit: z.number().int().min(1).optional().nullable(),
  onePerCustomer: z.boolean().optional(),
});

export class UpdatePromotionDto extends createZodDto(UpdatePromotionSchema) {}
