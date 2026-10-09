import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { MediaService } from './media.service.js';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('customFolder') customFolder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return await this.mediaService.uploadFile(file, customFolder);
  }

  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 20))
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('customFolder') customFolder?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const uploadPromises = files.map((file) =>
      this.mediaService.uploadFile(file, customFolder),
    );

    const results = await Promise.all(uploadPromises);

    return {
      success: true,
      count: results.length,
      files: results,
    };
  }

  @Delete('/delete')
  async delete(@Query('key') key: string) {
    if (!key) {
      throw new BadRequestException('Key is required');
    }
    await this.mediaService.deleteFile(key);
    return { message: 'File deleted successfully' };
  }

  @Get('/url/:key')
  async getUrl(@Param('key') key: string) {
    return {
      publicUrl: this.mediaService.getPublicUrl(key),
      signedUrl: await this.mediaService.getSignedUrl(key),
    };
  }
}
