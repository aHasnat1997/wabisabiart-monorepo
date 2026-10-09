import { Module } from '@nestjs/common';
import { SellerDashboardService } from './seller-dashboard.service.js';
import { SellerDashboardController } from './seller-dashboard.controller.js';
import { PrismaService } from '@wabisabiart/db';

@Module({
  controllers: [SellerDashboardController],
  providers: [SellerDashboardService, PrismaService],
})
export class SellerDashboardModule {}
