import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const CreateRuleSchema = z.object({
  name: z.string().min(1),
  minimumOrderAmount: z.number().min(0),
  region: z.string().min(1),
});

export class CreateRuleDto extends createZodDto(CreateRuleSchema) {}
