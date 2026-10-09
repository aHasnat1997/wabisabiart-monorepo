import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { FaqService } from './faq.service.js';
import {
  CreateFaqCategoryDto,
  UpdateFaqCategoryDto,
  CreateFaqQuestionDto,
  UpdateFaqQuestionDto,
} from './dto/faq.dto.js';
import { Auth } from '../../decorators/auth.decorator.js';

@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  // ── Admin: Categories ────────────────────────────────────────────────────

  @Post('categories')
  @Auth('admin')
  async createCategory(@Body() dto: CreateFaqCategoryDto) {
    const result = await this.faqService.createCategory(dto);
    return { message: 'FAQ category created 👍', data: result };
  }

  @Patch('categories/:id')
  @Auth('admin')
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateFaqCategoryDto,
  ) {
    const result = await this.faqService.updateCategory(id, dto);
    return { message: 'FAQ category updated 👍', data: result };
  }

  @Delete('categories/:id')
  @Auth('admin')
  async deleteCategory(@Param('id') id: string) {
    await this.faqService.deleteCategory(id);
    return { message: 'FAQ category deleted 👍' };
  }

  // ── Admin: Questions ─────────────────────────────────────────────────────

  @Post('questions')
  @Auth('admin')
  async createQuestion(@Body() dto: CreateFaqQuestionDto) {
    const result = await this.faqService.createQuestion(dto);
    return { message: 'FAQ question created 👍', data: result };
  }

  @Patch('questions/:id')
  @Auth('admin')
  async updateQuestion(
    @Param('id') id: string,
    @Body() dto: UpdateFaqQuestionDto,
  ) {
    const result = await this.faqService.updateQuestion(id, dto);
    return { message: 'FAQ question updated 👍', data: result };
  }

  @Delete('questions/:id')
  @Auth('admin')
  async deleteQuestion(@Param('id') id: string) {
    await this.faqService.deleteQuestion(id);
    return { message: 'FAQ question deleted 👍' };
  }

  // ── Public ───────────────────────────────────────────────────────────────

  @Get()
  async findAll() {
    const result = await this.faqService.findAll();
    return { message: 'FAQs fetched successfully 👍', data: result };
  }
}
