import { Module } from '@nestjs/common';
import { OrderService } from './order.service.js';
import { OrderController } from './order.controller.js';
import { PrismaService } from '@wabisabiart/db';
import { MarketingModule } from '../marketing/marketing.module.js';
import { StripeModule } from '../stripe/stripe.module.js';
import { CouponsService } from '../marketing/coupons/coupons.service.js';

@Module({
  imports: [MarketingModule, StripeModule],
  controllers: [OrderController],
  providers: [OrderService, PrismaService, CouponsService],
})
export class OrderModule {}
