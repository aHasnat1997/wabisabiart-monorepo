import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LegalsService } from './legals.service.js';
import { UpsertLegalPageDto } from './dto/legals.dto.js';
import { Auth } from '../../decorators/auth.decorator.js';
import { LegalPageType } from '@wabisabiart/db';

@Controller('legals')
export class LegalsController {
  constructor(private readonly legalsService: LegalsService) {}

  // Admin: create or update a legal page
  @Post()
  @Auth('admin')
  async upsert(@Body() dto: UpsertLegalPageDto) {
    const result = await this.legalsService.upsert(dto);
    return { message: 'Legal page saved successfully 👍', data: result };
  }

  // Public: get all legal pages
  @Get()
  async findAll() {
    const result = await this.legalsService.findAll();
    return { message: 'Legal pages fetched successfully 👍', data: result };
  }

  // Public: get a single legal page by type
  @Get(':type')
  async findOne(@Param('type') type: LegalPageType) {
    const result = await this.legalsService.findByType(type);
    return { message: 'Legal page fetched successfully 👍', data: result };
  }
}
