import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const UpsertLegalPageSchema = z.object({
  type: z.enum(['TERMS_OF_USE', 'PRIVACY_POLICY', 'COOKIE_POLICY']),
  content: z.string().min(1),
});

export class UpsertLegalPageDto extends createZodDto(UpsertLegalPageSchema) {}
