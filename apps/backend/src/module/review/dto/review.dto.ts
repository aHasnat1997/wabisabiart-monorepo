import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const CreateReviewSchema = z.object({
  productId: z.string(),
  orderId: z.string().optional(),
  comment: z.string().min(2).max(350),
  rating: z.number().min(1).max(5),
  images: z.array(z.string()).optional(),
});

const SellerRespondReviewSchema = z.object({
  reviewId: z.string(),
  sellerResponse: z.string().min(2).max(350),
});

export class CreateReviewDto extends createZodDto(CreateReviewSchema) {}
export class SellerRespondReviewDto extends createZodDto(
  SellerRespondReviewSchema,
) {}
