import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const UpdateGlobalConfigSchema = z.object({
  minimumOrderAmount: z.number().min(0).optional(),
  isEnabled: z.boolean().optional(),
});

export class UpdateGlobalConfigDto extends createZodDto(
  UpdateGlobalConfigSchema,
) {}
