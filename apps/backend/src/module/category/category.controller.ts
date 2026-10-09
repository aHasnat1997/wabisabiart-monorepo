import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service.js';
import { CreateCategoryDto, CreateSubCategoryDto } from './dto/category.dto.js';
import { Auth } from '../../../src/decorators/auth.decorator.js';
import {
  QueryBuilder,
  ParsedQuery,
} from '../../../src/decorators/query-builder.decorator.js';
import { OptionalAuthGuard } from '../auth/optional-auth.guard.js';
import type { Request } from 'express';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Auth('admin')
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoryService.create(createCategoryDto);
  }

  @Post('featured/:id')
  @Auth('admin')
  featureCategory(@Param('id') id: string) {
    return this.categoryService.featuredCategoryToggle(id);
  }

  @Post('good-for-gift/:id')
  @Auth('admin')
  goodForGiftCategory(@Param('id') id: string) {
    return this.categoryService.goodForGiftCategoryToggle(id);
  }

  @Post('subcategory')
  @Auth('admin')
  createSubCategory(@Body() data: CreateSubCategoryDto) {
    return this.categoryService.createSubCategory(data);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get('featured')
  @UseGuards(OptionalAuthGuard)
  featuredProducts(@Req() req: Request) {
    const userId = req.user?.id;
    return this.categoryService.featuredCategoriesWithProducts(userId);
  }

  @Get('good-for-gift')
  @UseGuards(OptionalAuthGuard)
  goodForGift(@Req() req: Request) {
    const userId = req.user?.id;
    return this.categoryService.goodForGiftCategories(userId);
  }

  @Get('best-selling')
  bestSellingCategories(
    @QueryBuilder({ defaultLimit: 10, maxLimit: 50 })
    query: ParsedQuery & { page: number; limit: number },
  ) {
    return this.categoryService.bestSellingCategories(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Delete(':id')
  @Auth('admin')
  remove(@Param('id') id: string) {
    return this.categoryService.removeCategory(id);
  }

  @Delete('subcategory/:id')
  @Auth('admin')
  removeSubCategory(@Param('id') id: string) {
    return this.categoryService.removeSubCategory(id);
  }
}
