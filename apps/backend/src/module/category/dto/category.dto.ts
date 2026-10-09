import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const CategorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(['crafts', 'customization', 'commissions']),
  description: z.string().optional(),
});

const SubCategorySchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
});

export class CreateCategoryDto extends createZodDto(CategorySchema) {}
export class CreateSubCategoryDto extends createZodDto(SubCategorySchema) {}
