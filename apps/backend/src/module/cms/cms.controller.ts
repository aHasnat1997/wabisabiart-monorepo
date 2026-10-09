import { Controller, Get, Post, Body } from '@nestjs/common';
import { CmsService } from './cms.service.js';
import { BannerCmDto, BrandSettingsDto, FooterSettingsDto } from './dto/cm.dto.js';
import { Auth } from '../../decorators/auth.decorator.js';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // ── Banner ──────────────────────────────────────────────────────────────────

  @Get('banner')
  async getBanner() {
    const data = await this.cmsService.getBanner();
    return { message: 'Banner fetched successfully', data };
  }

  @Post('banner')
  @Auth('admin')
  async upsertBanner(@Body() dto: BannerCmDto) {
    const data = await this.cmsService.upsertBanner(dto);
    return { message: 'Banner saved successfully', data };
  }

  // ── Brand Settings ──────────────────────────────────────────────────────────

  @Get('brand')
  async getBrandSettings() {
    const data = await this.cmsService.getBrandSettings();
    return { message: 'Brand settings fetched successfully', data };
  }

  @Post('brand')
  @Auth('admin')
  async upsertBrandSettings(@Body() dto: BrandSettingsDto) {
    const data = await this.cmsService.upsertBrandSettings(dto);
    return { message: 'Brand settings saved successfully', data };
  }

  // ── Footer Settings ─────────────────────────────────────────────────────────

  @Get('footer')
  async getFooterSettings() {
    const data = await this.cmsService.getFooterSettings();
    return { message: 'Footer settings fetched successfully', data };
  }

  @Post('footer')
  @Auth('admin')
  async upsertFooterSettings(@Body() dto: FooterSettingsDto) {
    const data = await this.cmsService.upsertFooterSettings(dto);
    return { message: 'Footer settings saved successfully', data };
  }
}
