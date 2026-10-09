import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const FeatureShopSchema = z.object({
  isFeatured: z.boolean(),
});

export class FeatureShopDto extends createZodDto(FeatureShopSchema) {}
