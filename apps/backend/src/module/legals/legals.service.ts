import { Injectable, NotFoundException } from '@nestjs/common';
import { UpsertLegalPageDto } from './dto/legals.dto.js';
import { PrismaService } from '@wabisabiart/db';
import { LegalPageType } from '@wabisabiart/db';

@Injectable()
export class LegalsService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(dto: UpsertLegalPageDto) {
    return this.prisma.legalPage.upsert({
      where: { type: dto.type },
      create: { type: dto.type, content: dto.content },
      update: { content: dto.content },
    });
  }

  async findByType(type: LegalPageType) {
    const page = await this.prisma.legalPage.findUnique({ where: { type } });
    if (!page) throw new NotFoundException(`${type} page not found`);
    return page;
  }

  findAll() {
    return this.prisma.legalPage.findMany();
  }
}
