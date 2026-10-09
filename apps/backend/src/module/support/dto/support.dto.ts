import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const CreateSupportTicketSchema = z.object({
  subject: z.string().min(1).max(150),
  category: z.enum([
    'ACCOUNT_LOGIN',
    'BILLING_PAYMENTS',
    'TECHNICAL_ERROR_BUG',
    'FEATURE_REQUEST',
    'DATA_LOSS_RECOVERY',
    'PRIVACY_SECURITY',
    'INTEGRATION_API',
    'PERFORMANCE_SLOWDOWN',
    'REPORTING_ANALYTICS',
    'OTHER',
  ]),
  message: z.string().min(1).max(500),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  attachments: z.array(z.string()).optional(),
});

const EmailSupportSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.email('Invalid email format'),
  subject: z.string().min(1).max(150),
  message: z.string().min(1).max(500),
});

const SupportContactDetailsSchema = z.object({
  email: z.email('Invalid email format'),
  phoneNumber: z.string().optional(),
  availableTimeRange: z.string().optional(),
  availableWeekRange: z.string().optional(),
  responseTime: z.string().optional(),
});

const ReplyEmailSchema = z.object({
  message: z.string().min(1).max(2000),
  subject: z.string().optional(),
});

export class ReplyEmailDto extends createZodDto(ReplyEmailSchema) {}

export class CreateSupportTicketDto extends createZodDto(
  CreateSupportTicketSchema,
) {}

const UpdateSupportTicketSchema = z
  .object({
    status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  })
  .strict();

export class UpdateSupportTicketDto extends createZodDto(
  UpdateSupportTicketSchema,
) {}

export class EmailSupportDto extends createZodDto(EmailSupportSchema) {}

export class CreateSupportContactDto extends createZodDto(
  SupportContactDetailsSchema,
) {}
