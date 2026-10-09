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
import { FreeShippingService } from './free-shipping.service.js';
import { CreateRuleDto } from './dto/create-rule.dto.js';
import { UpdateRuleDto } from './dto/update-rule.dto.js';
import { UpdateGlobalConfigDto } from './dto/update-global-config.dto.js';
import { SellerOwnsFreeShippingRuleGuard } from '../guards/seller-owns-free-shipping-rule.guard.js';

@Controller('seller/marketing/free-shipping')
@Auth('seller')
export class FreeShippingController {
  constructor(private readonly freeShippingService: FreeShippingService) {}

  @Get('config')
  async getGlobalConfig(@Req() req: Request) {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.freeShippingService.getGlobalConfig(sellerId);
  }

  @Patch('config')
  async updateGlobalConfig(
    @Req() req: Request,
    @Body() dto: UpdateGlobalConfigDto,
  ) {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.freeShippingService.updateGlobalConfig(sellerId, dto);
  }

  @Patch('config/toggle')
  async toggleGlobalConfig(@Req() req: Request) {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.freeShippingService.toggleGlobalConfig(sellerId);
  }

  @Get('rules')
  async getAllRules(@Req() req: Request) {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.freeShippingService.getAllRules(sellerId);
  }

  @Post('rules')
  async createRule(@Req() req: Request, @Body() dto: CreateRuleDto) {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.freeShippingService.createRule(sellerId, dto);
  }

  @Get('stats')
  async getDashboardStats(@Req() req: Request) {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.freeShippingService.getDashboardStats(sellerId);
  }

  @Patch('rules/:id')
  @UseGuards(SellerOwnsFreeShippingRuleGuard)
  async updateRule(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateRuleDto,
  ) {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.freeShippingService.updateRule(id, sellerId, dto);
  }

  @Patch('rules/:id/toggle')
  @UseGuards(SellerOwnsFreeShippingRuleGuard)
  async toggleRule(@Req() req: Request, @Param('id') id: string) {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.freeShippingService.toggleRule(id, sellerId);
  }

  @Delete('rules/:id')
  @UseGuards(SellerOwnsFreeShippingRuleGuard)
  async removeRule(@Req() req: Request, @Param('id') id: string) {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.freeShippingService.removeRule(id, sellerId);
  }
}
