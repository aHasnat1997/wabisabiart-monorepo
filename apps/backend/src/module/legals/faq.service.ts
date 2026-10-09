import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@wabisabiart/db';
import {
  CreateFaqCategoryDto,
  UpdateFaqCategoryDto,
  CreateFaqQuestionDto,
  UpdateFaqQuestionDto,
} from './dto/faq.dto.js';

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Categories ──────────────────────────────────────────────────────────

  createCategory(dto: CreateFaqCategoryDto) {
    return this.prisma.faqCategory.create({
      data: dto,
    });
  }

  updateCategory(id: string, dto: UpdateFaqCategoryDto) {
    return this.prisma.faqCategory.update({
      where: { id },
      data: dto,
    });
  }

  deleteCategory(id: string) {
    return this.prisma.faqCategory.delete({
      where: { id },
    });
  }

  // ── Questions ───────────────────────────────────────────────────────────

  createQuestion(dto: CreateFaqQuestionDto) {
    return this.prisma.faqQuestion.create({
      data: dto,
    });
  }

  updateQuestion(id: string, dto: UpdateFaqQuestionDto) {
    return this.prisma.faqQuestion.update({
      where: { id },
      data: dto,
    });
  }

  deleteQuestion(id: string) {
    return this.prisma.faqQuestion.delete({
      where: { id },
    });
  }

  // ── Public ──────────────────────────────────────────────────────────────

  async findAll() {
    return this.prisma.faqCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }
}
