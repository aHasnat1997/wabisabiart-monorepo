import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const PreviewCouponSchema = z.object({
  code: z.string().min(1),
});

export class PreviewCouponDto extends createZodDto(PreviewCouponSchema) {}
