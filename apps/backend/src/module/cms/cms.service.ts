import { Injectable } from '@nestjs/common';
import { BannerCmDto, BrandSettingsDto, FooterSettingsDto } from './dto/cm.dto.js';
import { PrismaService } from '@wabisabiart/db';

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Banner ──────────────────────────────────────────────────────────────────

  async upsertBanner(dto: BannerCmDto) {
    const existing = await this.prisma.banner.findFirst();
    if (existing) {
      return this.prisma.banner.update({ where: { id: existing.id }, data: dto });
    }
    return this.prisma.banner.create({ data: dto });
  }

  async getBanner() {
    return this.prisma.banner.findFirst();
  }

  // ── Brand Settings ──────────────────────────────────────────────────────────

  async upsertBrandSettings(dto: BrandSettingsDto) {
    const existing = await this.prisma.brandSettings.findFirst();
    if (existing) {
      return this.prisma.brandSettings.update({ where: { id: existing.id }, data: dto });
    }
    return this.prisma.brandSettings.create({ data: dto });
  }

  async getBrandSettings() {
    return this.prisma.brandSettings.findFirst();
  }

  // ── Footer Settings ─────────────────────────────────────────────────────────

  async upsertFooterSettings(dto: FooterSettingsDto) {
    const existing = await this.prisma.footerSettings.findFirst();
    if (existing) {
      return this.prisma.footerSettings.update({ where: { id: existing.id }, data: dto });
    }
    return this.prisma.footerSettings.create({ data: dto });
  }

  async getFooterSettings() {
    return this.prisma.footerSettings.findFirst();
  }
}
