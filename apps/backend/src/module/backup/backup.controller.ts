import {
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import 'multer';
import type { Response } from 'express';
import { BackupService } from './backup.service.js';
import { Auth } from '../../decorators/auth.decorator.js';

@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  /**
   * GET /backup
   * Streams a ZIP file (one CSV per table) back to the admin's browser as a download.
   */
  @Get()
  @Auth('admin')
  async downloadBackup(@Res() res: Response) {
    const zipBuffer = await this.backupService.exportBackup();
    const filename = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.zip`;

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': zipBuffer.length,
    });
    res.end(zipBuffer);
  }

  /**
   * POST /backup/restore
   * Accepts a ZIP file upload (multipart/form-data, field name "file") and restores it.
   */
  @Post('restore')
  @Auth('admin')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 500 * 1024 * 1024 }, // 500MB cap, tune to your DB size
    }),
  )
  async restoreBackup(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(
        'No file uploaded. Expected field name "file".',
      );
    }
    if (!file.originalname.endsWith('.zip')) {
      throw new BadRequestException('Uploaded file must be a .zip archive.');
    }

    const result = await this.backupService.restoreBackup(file.buffer);
    return {
      message: 'Restore completed',
      ...result,
    };
  }
}
