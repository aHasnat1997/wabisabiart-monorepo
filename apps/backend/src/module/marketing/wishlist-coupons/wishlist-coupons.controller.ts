/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import { Auth } from '../../../decorators/auth.decorator.js';
import { PrismaService } from '@wabisabiart/db';
import type { Request } from 'express';
import { WishlistCouponsService } from './wishlist-coupons.service.js';
import { UpdateWishlistConfigDto } from './dto/update-config.dto.js';

@Controller('seller/marketing/wishlist-coupons')
@Auth('seller')
export class WishlistCouponsController {
  constructor(
    private readonly wishlistCouponsService: WishlistCouponsService,
    private readonly prisma: PrismaService,
  ) {}

  private async sellerIdFromReq(req: Request) {
    const profile = await this.prisma.sellerProfile.findUnique({
      where: { userId: req.user?.id as string },
      select: { id: true },
    });

    if (!profile) {
      throw new BadRequestException('Seller profile not found');
    }

    return profile.id;
  }

  @Get('config')
  async getConfig(@Req() req: Request) {
    const sellerId = await this.sellerIdFromReq(req);
    return this.wishlistCouponsService.getConfig(sellerId);
  }

  @Patch('config')
  async updateConfig(
    @Req() req: Request,
    @Body() dto: UpdateWishlistConfigDto,
  ) {
    const sellerId = await this.sellerIdFromReq(req);
    return this.wishlistCouponsService.updateConfig(sellerId, dto);
  }

  @Patch('config/toggle')
  async toggleEnabled(@Req() req: Request) {
    const sellerId = await this.sellerIdFromReq(req);
    return this.wishlistCouponsService.toggleEnabled(sellerId);
  }

  @Get('stats')
  async getStats(@Req() req: Request) {
    const sellerId = await this.sellerIdFromReq(req);
    return this.wishlistCouponsService.getStats(sellerId);
  }

  @Get('activity')
  async getRecentActivity(@Req() req: Request, @Query('limit') limit?: string) {
    const sellerId = await this.sellerIdFromReq(req);
    const parsedLimit = limit ? Number(limit) : 20;
    return this.wishlistCouponsService.getRecentActivity(sellerId, parsedLimit);
  }
}
