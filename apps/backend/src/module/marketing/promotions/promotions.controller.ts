import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PromotionsService } from './promotions.service.js';
import { CreatePromotionDto } from './dto/create-promotion.dto.js';
import { UpdatePromotionDto } from './dto/update-promotion.dto.js';
import { Auth } from '../../../decorators/auth.decorator.js';
import { SellerOwnsPromotionGuard } from '../guards/seller-owns-promotion.guard.js';
import type { Request } from 'express';

@Controller('seller/marketing/promotions')
@Auth('seller')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Get()
  async findAll(
    @Req() req: Request,
    @Query('filter') filter?: 'active' | 'inactive',
  ) {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.promotionsService.findAll(sellerId, filter);
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreatePromotionDto) {
    const seller = req.user as Record<string, any>;
    return this.promotionsService.create(seller, dto);
  }

  @Get('overview')
  async getOverviewStats(@Req() req: Request) {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.promotionsService.getOverviewStats(sellerId);
  }

  @Get(':id')
  @UseGuards(SellerOwnsPromotionGuard)
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.promotionsService.findOne(id, sellerId);
  }

  @Patch(':id')
  @UseGuards(SellerOwnsPromotionGuard)
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdatePromotionDto,
  ) {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.promotionsService.update(id, sellerId, dto);
  }

  @Patch(':id/toggle')
  @UseGuards(SellerOwnsPromotionGuard)
  async toggleActive(@Req() req: Request, @Param('id') id: string) {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.promotionsService.toggleActive(id, sellerId);
  }

  @Delete(':id')
  @UseGuards(SellerOwnsPromotionGuard)
  async remove(@Req() req: Request, @Param('id') id: string) {
    const sellerId = req.user?.sellerProfile?.id as string;
    return this.promotionsService.remove(id, sellerId);
  }
}
