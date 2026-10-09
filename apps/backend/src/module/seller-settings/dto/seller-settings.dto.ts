import { createZodDto } from 'nestjs-zod';
import { mediaUrlSchema } from '../../../../src/utils/media-url.util.js';
import z from 'zod';

const UpdateSellerProfileSchema = z.object({
  fullName: z.string().min(1).optional(),
  phoneNumber: z.string().min(1).optional(),
  avatarUrl: mediaUrlSchema.optional(),
  marketingEmailsEnabled: z.boolean().optional(),
});

const UpdateSellerStoreSchema = z.object({
  shopName: z.string().min(3).optional(),
  shopDescription: z.string().optional(),
  shopAnnouncement: z.string().optional(),
  address: z.string().optional(),
  shopLogo: mediaUrlSchema.optional(),
  shopBannerImage: mediaUrlSchema.optional(),
  shopPolicies: z.string().optional(),
  returnPolicy: z.string().optional(),
  privacyPolicy: z.string().optional(),
  shippingPolicy: z.string().optional(),
  shopLatitude: z.number().min(-90).max(90).optional(),
  shopLongitude: z.number().min(-180).max(180).optional(),
  facebookUrl: z.url().optional(),
  instagramUrl: z.url().optional(),
  twitterUrl: z.url().optional(),
  websiteUrl: z.url().optional(),
});

const SubmitAuthenticitySchema = z.object({
  shopName: z.string().min(3),
  shopDescription: z.string(),
  address: z.string(),
  shopLogo: mediaUrlSchema.optional(),
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

const ChangeSellerPasswordSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '❌ Confirm Passwords not match with Password!',
    path: ['confirmPassword'],
  });

const UpdatePlatformFeeSchema = z.object({
  platformFeePercent: z.number().min(0).max(100).optional(),
  paymentProcessingPercent: z.number().min(0).max(100).optional(),
  paymentProcessingFlat: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export class UpdateSellerProfileDto extends createZodDto(
  UpdateSellerProfileSchema,
) {}

export class UpdateSellerStoreDto extends createZodDto(
  UpdateSellerStoreSchema,
) {}

export class SubmitAuthenticityDto extends createZodDto(
  SubmitAuthenticitySchema,
) {}

export class ChangeSellerPasswordDto extends createZodDto(
  ChangeSellerPasswordSchema,
) {}

export class UpdatePlatformFeeDto extends createZodDto(
  UpdatePlatformFeeSchema,
) {}
