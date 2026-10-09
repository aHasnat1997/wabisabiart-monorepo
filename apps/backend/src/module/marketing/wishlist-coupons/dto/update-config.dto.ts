import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const UpdateWishlistConfigSchema = z.object({
  discountPercentage: z.number().min(1).max(100).optional(),
  validityDays: z.number().int().min(1).max(365).optional(),
  sendEmailNotification: z.boolean().optional(),
  autoApplyAtCheckout: z.boolean().optional(),
  isEnabled: z.boolean().optional(),
});

export class UpdateWishlistConfigDto extends createZodDto(
  UpdateWishlistConfigSchema,
) {}
