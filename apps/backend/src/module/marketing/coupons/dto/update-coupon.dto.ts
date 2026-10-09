import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const UpdateCouponSchema = z.object({
  discountType: z.enum(['PERCENTAGE', 'FIXED', 'FREE_SHIPPING']).optional(),
  discountValue: z.number().min(0).optional(),
  maximumUses: z.number().int().min(1).optional(),
  maximumDiscount: z.number().min(0).optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  startsAt: z.string().datetime().optional(),
  minimumPurchase: z.number().min(0).optional(),
  usageLimitPerUser: z.number().int().min(1).optional().nullable(),
  customerRestriction: z
    .enum(['ALL_CUSTOMERS', 'NEW_CUSTOMERS', 'VIP_ONLY'])
    .optional(),
  isActive: z.boolean().optional(),
});

export class UpdateCouponDto extends createZodDto(UpdateCouponSchema) {}
