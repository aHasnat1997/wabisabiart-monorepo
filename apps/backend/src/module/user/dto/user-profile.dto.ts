import { createZodDto } from 'nestjs-zod';
import { mediaUrlSchema } from '../../../../src/utils/media-url.util.js';
import z from 'zod';

const UpdateUserProfileSchema = z.object({
  fullName: z.string().min(1).optional(),
  dob: z.string().datetime().optional().nullable(),
  avatarUrl: mediaUrlSchema.optional(),
});

const UpdateSellerProfileSchema = z.object({
  shopName: z.string().min(3).optional(),
  shopDescription: z.string().optional(),
  shopBannerImage: mediaUrlSchema.optional(),
  shopLogo: mediaUrlSchema.optional(),
  address: z.string().optional(),
  shopPolicies: z.string().optional(),
  returnPolicy: z.string().optional(),
  privacyPolicy: z.string().optional(),
  shippingPolicy: z.string().optional(),
  facebookUrl: z.string().url().optional(),
  instagramUrl: z.string().url().optional(),
  twitterUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
});

export class UpdateUserProfileDto extends createZodDto(
  UpdateUserProfileSchema,
) {}

export class UpdateSellerProfileDto extends createZodDto(
  UpdateSellerProfileSchema,
) {}
