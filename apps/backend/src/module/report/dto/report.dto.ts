import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const CreateReportSchema = z.object({
  productId: z.uuid(),
  reason: z.enum([
    'spam',
    'counterfeit',
    'inappropriate',
    'misleading',
    'other',
  ]),
  description: z.string().max(1000).optional(),
});

const ApproveReportSchema = z.object({
  resolution: z.string().max(1000).optional(),
});

export class CreateReportDto extends createZodDto(CreateReportSchema) {}
export class ApproveReportDto extends createZodDto(ApproveReportSchema) {}
