import { z } from "zod";

export const supportTicketApiSchema = z.object({
  subject: z.string().min(5).max(200),
  category: z.string(),
  priority: z.string(),

  message: z.string().min(10).max(10000), 
  attachments: z.array(z.string()).optional(),
});

export type SupportTicketFormValues = z.infer<
  typeof supportTicketApiSchema
>;
