import { Module } from '@nestjs/common';
import { JournalService } from './journal.service.js';
import { JournalController } from './journal.controller.js';
import { PrismaService } from '@wabisabiart/db';

@Module({
  controllers: [JournalController],
  providers: [JournalService, PrismaService],
})
export class JournalModule {}
