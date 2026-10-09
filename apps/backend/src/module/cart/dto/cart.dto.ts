import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const CreateCartSchema = z.object({
  productId: z.uuid(),
  variantId: z.uuid(),
  quantity: z.number().int().positive(),
  customization: z.string().optional(),
});

export class CreateCartDto extends createZodDto(CreateCartSchema) {}
