import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const CreatePaymentIntentSchema = z.object({
  orderId: z.uuid(),
  paymentMethodId: z.string().optional(),
});

const CreateCheckoutSessionSchema = z.object({
  orderId: z.uuid(),
  successUrl: z.string().trim().min(1),
  cancelUrl: z.string().trim().min(1),
});

const RefundOrderSchema = z.object({
  orderId: z.uuid(),
  amountCents: z.number().int().positive().optional(),
  reason: z
    .enum(['duplicate', 'fraudulent', 'requested_by_customer'])
    .optional(),
});

export class CreatePaymentIntentDto extends createZodDto(
  CreatePaymentIntentSchema,
) {}
export class CreateCheckoutSessionDto extends createZodDto(
  CreateCheckoutSessionSchema,
) {}
export class RefundOrderDto extends createZodDto(RefundOrderSchema) {}
