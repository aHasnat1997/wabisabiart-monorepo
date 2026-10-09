import { PartialType } from '@nestjs/mapped-types';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const CreateJournalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  bannerImage: z.string().optional(),
  shortExcerpt: z
    .string()
    .max(250, 'Short excerpt must be at most 250 characters'),
  content: z.string().min(1, 'Content is required'),
  postStatus: z.enum(['draft', 'publishing_request'], {
    message: 'Post status must be draft or publishing_request',
  }),
});

export class CreateJournalDto extends createZodDto(CreateJournalSchema) {}
export class UpdateJournalDto extends PartialType(CreateJournalDto) {}
