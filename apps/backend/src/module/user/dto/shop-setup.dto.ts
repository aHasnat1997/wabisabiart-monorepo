import { createZodDto } from 'nestjs-zod';
import { mediaUrlSchema } from '../../../../src/utils/media-url.util.js';
import z from 'zod';

const ShopSetupSchema = z.object({
  shopName: z.string().min(3),
  shopDescription: z.string(),
  address: z.string(),
  shopLogo: z.string().optional(),
  shopBannerImage: mediaUrlSchema.optional(),
  proofOfIdentity: mediaUrlSchema,
  sampleProducts: z.array(mediaUrlSchema).optional(),
  isAgreedToTermsAndConditions: z.literal(true, {
    message: '❌ You must agree to terms and conditions!',
  }),
  isHandcraftedOrEthicallySourced: z.literal(true, {
    message: '❌ You must agree to terms and conditions!',
  }),
});

export class ShopSetupDto extends createZodDto(ShopSetupSchema) {}
