import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const CreateCouponSchema = z.object({
  code: z
    .string()
    .min(1)
    .regex(/^[A-Z0-9]+$/, {
      message:
        'Coupon code must be uppercase letters and numbers only, no spaces',
    }),
  discountType: z.enum(['PERCENTAGE', 'FIXED', 'FREE_SHIPPING']),
  discountValue: z.number().min(0),
  maximumUses: z.number().int().min(1).default(100),
  maximumDiscount: z.number().min(0).optional(),
  expiresAt: z.string().datetime(),
  startsAt: z.string().datetime().optional(),
  minimumPurchase: z.number().min(0).optional(),
  usageLimitPerUser: z.number().int().min(1).optional(),
  customerRestriction: z
    .enum(['ALL_CUSTOMERS', 'NEW_CUSTOMERS', 'VIP_ONLY'])
    .default('ALL_CUSTOMERS')
    .optional(),
  isActive: z.boolean().optional(),
});

export class CreateCouponDto extends createZodDto(CreateCouponSchema) {}
