import { Module } from '@nestjs/common';
import { BackupController } from './backup.controller.js';
import { BackupService } from './backup.service.js';
import { PrismaService } from '@wabisabiart/db';

@Module({
  controllers: [BackupController],
  providers: [BackupService, PrismaService],
})
export class BackupModule {}
