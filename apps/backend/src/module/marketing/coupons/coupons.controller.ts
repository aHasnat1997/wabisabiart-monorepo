import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Auth } from '../../../decorators/auth.decorator.js';
import type { Request } from 'express';
import { CouponsService } from './coupons.service.js';
import { CreateCouponDto } from './dto/create-coupon.dto.js';
import { UpdateCouponDto } from './dto/update-coupon.dto.js';
import { SellerOwnsCouponGuard } from '../guards/seller-owns-coupon.guard.js';

@Controller('seller/marketing/coupons')
@Auth('seller')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  async findAll(@Req() req: Request) {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.couponsService.findAll(sellerId);
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateCouponDto) {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.couponsService.create(sellerId, dto);
  }

  @Get('generate-code')
  generateCode() {
    const code = this.couponsService.generateCode();
    return { code };
  }

  @Get('stats')
  async getDashboardStats(@Req() req: Request) {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.couponsService.getDashboardStats(sellerId);
  }

  @Get(':id')
  @UseGuards(SellerOwnsCouponGuard)
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.couponsService.findOne(id, sellerId);
  }

  @Patch(':id')
  @UseGuards(SellerOwnsCouponGuard)
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateCouponDto,
  ) {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.couponsService.update(id, sellerId, dto);
  }

  @Patch(':id/toggle')
  @UseGuards(SellerOwnsCouponGuard)
  async toggleActive(@Req() req: Request, @Param('id') id: string) {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.couponsService.toggleActive(id, sellerId);
  }

  @Delete(':id')
  @UseGuards(SellerOwnsCouponGuard)
  async remove(@Req() req: Request, @Param('id') id: string) {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.couponsService.remove(id, sellerId);
  }
}
