import { Module } from '@nestjs/common';
import { LegalsController } from './legals.controller.js';
import { LegalsService } from './legals.service.js';
import { PrismaService } from '@wabisabiart/db';
import { FaqController } from './faq.controller.js';
import { FaqService } from './faq.service.js';

@Module({
  controllers: [LegalsController, FaqController],
  providers: [LegalsService, FaqService, PrismaService],
})
export class LegalsModule {}
