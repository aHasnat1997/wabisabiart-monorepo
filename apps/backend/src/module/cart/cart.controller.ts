import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { CartService } from './cart.service.js';
import { CreateCartDto } from './dto/cart.dto.js';
import { Auth } from '../../../src/decorators/auth.decorator.js';
import type { Request } from 'express';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @Auth('customer', 'seller')
  async create(@Body() createCartDto: CreateCartDto, @Req() req: Request) {
    const userId = req?.user?.id as string;
    return await this.cartService.addToCart(userId, createCartDto);
  }

  @Get('all')
  @Auth('admin')
  async findAll() {
    return await this.cartService.findAllCart();
  }

  @Get('calculate')
  @Auth('customer', 'seller')
  async calculateItems(@Req() req: Request, @Query('coupon') coupon?: string) {
    const userId = req?.user?.id as string;
    return await this.cartService.cartCalculate(userId, coupon);
  }

  @Get()
  @Auth('customer', 'seller')
  async findMyCart(@Req() req: Request) {
    const userId = req?.user?.id as string;
    return await this.cartService.findMyCart(userId);
  }

  @Patch()
  @Auth('customer', 'seller')
  async update(
    @Body() payload: { productId: string; quantity: number },
    @Req() req: Request,
  ) {
    const userId = req?.user?.id as string;
    return await this.cartService.updateQuantity(
      userId,
      payload.productId,
      payload.quantity,
    );
  }

  @Delete()
  @Auth('customer', 'seller')
  async removeFromCart(
    @Req() req: Request,
    @Body() payload: { productId: string },
  ) {
    const userId = req?.user?.id as string;
    return await this.cartService.removeFromCart(userId, payload.productId);
  }
}
