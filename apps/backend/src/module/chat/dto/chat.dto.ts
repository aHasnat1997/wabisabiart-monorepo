import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const SendMessageSchema = z.object({
  conversationId: z.uuid().optional(),
  receiverId: z.uuid().optional(), // sellerProfile.id, omit for 'support'
  orderId: z.uuid().optional(),
  productId: z.uuid().optional(), // for product_inquiry context, if you want to store it
  type: z
    .enum([
      'general',
      'order_inquiry',
      'refund_request',
      'product_inquiry',
      'support',
    ])
    .default('general'),
  content: z.string().min(1),
  attachments: z.array(z.string()).default([]),
});

export const CreateConversationSchema = z.object({
  conversationId: z.uuid().optional(), // join existing
  receiverId: z.uuid().optional(), // sellerProfile.id
  orderId: z.uuid().optional(),
  productId: z.uuid().optional(),
  type: z
    .enum([
      'general',
      'order_inquiry',
      'refund_request',
      'product_inquiry',
      'support',
    ])
    .default('general'),
});

export class CreateConversationDto extends createZodDto(
  CreateConversationSchema,
) {}

export class SendMessageDto extends createZodDto(SendMessageSchema) {}

export const MarkReadSchema = z.object({
  conversationId: z.uuid(),
});
export class MarkReadDto extends createZodDto(MarkReadSchema) {}

export const JoinConversationSchema = z.object({
  conversationId: z.uuid(),
});
export class JoinConversationDto extends createZodDto(JoinConversationSchema) {}

export class CreateChatDto {}
