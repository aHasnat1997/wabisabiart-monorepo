import { createZodDto } from 'nestjs-zod';
import z from 'zod';

// --- Category ---
const CreateFaqCategorySchema = z.object({
  name: z.string().min(1),
  order: z.number().int().default(0),
});

const UpdateFaqCategorySchema = CreateFaqCategorySchema.partial();

export class CreateFaqCategoryDto extends createZodDto(
  CreateFaqCategorySchema,
) {}
export class UpdateFaqCategoryDto extends createZodDto(
  UpdateFaqCategorySchema,
) {}

// --- Question ---
const CreateFaqQuestionSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  order: z.number().int().default(0),
  categoryId: z.string().uuid(),
});

const UpdateFaqQuestionSchema = CreateFaqQuestionSchema.partial();

export class CreateFaqQuestionDto extends createZodDto(
  CreateFaqQuestionSchema,
) {}
export class UpdateFaqQuestionDto extends createZodDto(
  UpdateFaqQuestionSchema,
) {}
