import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const BannerSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional(),
  imageUrl: z.string().min(1, 'Image URL is required'),
  background: z.string().optional().default(''),
});

const BrandSettingsSchema = z.object({
  name: z.string().min(1, 'Platform name is required'),
  logoUrl: z.string().nullable().optional(),
  faviconUrl: z.string().nullable().optional(),
});

const FooterSettingsSchema = z.object({
  text: z.string().min(1, 'Footer text is required'),
});

export class BannerCmDto extends createZodDto(BannerSchema) {}
export class BrandSettingsDto extends createZodDto(BrandSettingsSchema) {}
export class FooterSettingsDto extends createZodDto(FooterSettingsSchema) {}
