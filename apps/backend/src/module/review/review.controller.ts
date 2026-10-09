import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  Query,
  Res,
} from '@nestjs/common';
import { ReviewService } from './review.service.js';
import { CreateReviewDto, SellerRespondReviewDto } from './dto/review.dto.js';
import { Auth } from '../../decorators/auth.decorator.js';
import type { Request, Response } from 'express';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @Auth('customer')
  create(@Body() createReviewDto: CreateReviewDto, @Req() req: Request) {
    return this.reviewService.create(req?.user?.id as string, createReviewDto);
  }

  @Get(':productId')
  findAllReviewForProduct(@Param('productId') productId: string) {
    return this.reviewService.findAllReviewForProduct(productId);
  }

  @Get('connect/shopify')
  @Auth('seller')
  async connectShopify(
    @Query('shop') shop: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const authUrl = await this.reviewService.getShopifyAuthUrl(
      shop,
      req?.user?.id as string,
    );
    return res.redirect(authUrl);
  }

  // 2. Shopify Authorization Callback Handler
  @Get('callback/shopify')
  async shopifyCallback(
    @Query('code') code: string,
    @Query('shop') shop: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    await this.reviewService.handleShopifyCallback(code, shop, state);

    // Redirect back to your Refine Admin Dashboard UI built on Vite
    return res.redirect(
      `${process.env.FRONTEND_URL}/seller/settings?sync=success`,
    );
  }

  @Patch('respond')
  @Auth('seller')
  sellerRespondToReview(
    @Body() respondDto: SellerRespondReviewDto,
    @Req() req: Request,
  ) {
    return this.reviewService.sellerRespondToReview(
      req?.user?.id as string,
      respondDto,
    );
  }
}
