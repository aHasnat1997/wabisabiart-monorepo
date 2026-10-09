import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const UpdateRuleSchema = z.object({
  name: z.string().min(1).optional(),
  minimumOrderAmount: z.number().min(0).optional(),
  region: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export class UpdateRuleDto extends createZodDto(UpdateRuleSchema) {}
