import { Module } from '@nestjs/common';
import { InsightsService } from './insights.service.js';
import { InsightsController } from './insights.controller.js';
import { PrismaService } from '@wabisabiart/db';

@Module({
  controllers: [InsightsController],
  providers: [InsightsService, PrismaService],
})
export class InsightsModule {}
