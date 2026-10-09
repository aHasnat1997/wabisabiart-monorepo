import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service.js';
import {
  CreateProductDto,
  UpdateProductDetailsDto,
  UpdateProductVariantDto,
} from './dto/product.dto.js';
import type { Request } from 'express';
import { Auth } from '../../../src/decorators/auth.decorator.js';
import {
  ParsedQuery,
  QueryBuilder,
} from '../../../src/decorators/query-builder.decorator.js';
import {
  Product,
  ProductStatus,
} from '@wabisabiart/db';
import { OptionalAuthGuard } from '../auth/optional-auth.guard.js';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Auth('seller')
  async create(
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request,
  ) {
    const userId = req?.user?.id as string;
    const result = await this.productService.create(createProductDto, userId);

    return {
      message: 'Product created successfully 👍',
      data: result,
    };
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  async findAll(
    @Req() req: Request,
    @QueryBuilder<Product>({
      searchFields: ['title', 'subtitle', 'description'],
      enumFields: ['discountType', 'status', 'categoryType'],
      booleanFields: ['customizable', 'handmade', 'madeToOrder', 'isFeatured'],
      defaultSort: { field: 'createdAt', order: 'desc' },
      defaultLimit: 10,
      maxLimit: 100,
      include: {
        seller: {
          select: { id: true, email: true, fullName: true, avatarUrl: true },
        },
        variants: true,
        category: true,
        subCategory: true,
      },
    })
    query: ParsedQuery & { page: number; limit: number },
  ) {
    const userId = req.user?.id;
    const { meta, data } = await this.productService.findAll(query, userId);
    return {
      message: 'Products fetched successfully 👍',
      data: {
        items: data,
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
      },
    };
  }

  @Get('/best-deals')
  @UseGuards(OptionalAuthGuard)
  async findAllBestDeals(
    @Req() req: Request,
    @QueryBuilder<Product>({
      searchFields: ['title', 'subtitle', 'description'],
      enumFields: ['discountType', 'status', 'categoryType'],
      booleanFields: ['customizable', 'handmade', 'madeToOrder', 'isFeatured'],
      defaultSort: { field: 'createdAt', order: 'desc' },
      defaultLimit: 10,
      maxLimit: 100,
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        variants: true,
        category: true,
        subCategory: true,
      },
    })
    query: ParsedQuery & { page: number; limit: number },
  ) {
    const userId = req.user?.id;
    const { meta, data } = await this.productService.findAllBestDeals(
      query,
      userId,
    );

    return {
      message: "Today's Big Deals fetched successfully 👍",
      data: {
        items: data,
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
      },
    };
  }

  @Get('/my-products')
  @Auth('seller')
  async myProducts(
    @Req() req: Request,
    @QueryBuilder<Product>({
      searchFields: ['title', 'subtitle', 'description'],
      enumFields: ['discountType', 'status', 'categoryType'],
      booleanFields: ['customizable', 'handmade', 'madeToOrder', 'isFeatured'],
      defaultSort: { field: 'createdAt', order: 'desc' },
      defaultLimit: 10,
      maxLimit: 100,
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        variants: true,
        category: true,
        subCategory: true,
      },
    })
    query: ParsedQuery & { page: number; limit: number },
  ) {
    const userId = req?.user?.id as string;
    const { meta, data } = await this.productService.sellerProducts(
      userId,
      query,
    );

    return {
      message: 'Your products fetched successfully 👍',
      data: {
        items: data,
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
        totalPage: meta.totalPage,
      },
    };
  }

  @Get('/pending_review')
  @Auth('admin')
  async findAllPendingReview(
    @QueryBuilder<Product>({
      searchFields: ['title', 'subtitle', 'description'],
      enumFields: ['discountType', 'status', 'categoryType'],
      booleanFields: ['customizable', 'handmade', 'madeToOrder', 'isFeatured'],
      defaultSort: { field: 'createdAt', order: 'desc' },
      defaultLimit: 10,
      maxLimit: 100,
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        variants: true,
        category: true,
        subCategory: true,
      },
    })
    query: ParsedQuery & { page: number; limit: number },
  ) {
    const { meta, data } =
      await this.productService.findAllPendingReview(query);

    return {
      message: 'Products pending review fetched successfully 👍',
      data: {
        items: data,
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
      },
    };
  }

  @Get('/my-listing-status')
  @Auth('seller')
  async myListingStatus(@Req() req: Request) {
    const userId = req?.user?.id as string;
    return await this.productService.myListingStatus(userId);
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const userId = req.user?.id;
    return await this.productService.findOne(id, userId);
  }

  @Patch(':id')
  @Auth('seller')
  async update(
    @Param('id') id: string,
    @Body() UpdateProductDetailsDto: UpdateProductDetailsDto,
    @Req() req: Request,
  ) {
    const userId = req?.user?.id as string;

    return await this.productService.updateProductDetails(
      id,
      userId,
      UpdateProductDetailsDto,
    );
  }

  @Delete(':id')
  @Auth('seller')
  remove(@Param('id') id: string, @Req() req: Request) {
    const userId = req?.user?.id as string;
    return this.productService.remove(id, userId);
  }

  @Post('/variant/:id')
  @Auth('seller')
  async addVariant(
    @Param('id') id: string,
    @Body() variant: UpdateProductVariantDto,
    @Req() req: Request,
  ) {
    const userId = req?.user?.id as string;
    return await this.productService.addVariant(userId, id, variant);
  }

  @Patch('/status/:id')
  @Auth('admin')
  async changeStatus(
    @Param('id') id: string,
    @Body() body: { status: ProductStatus },
  ) {
    const result = await this.productService.changeProductStatus(
      id,
      body.status,
    );
    return {
      message: `Product ${body.status} successfully`,
      data: result,
    };
  }

  @Patch('/refill-stock/:variantId')
  @Auth('seller')
  async refillStock(
    @Param('variantId') variantId: string,
    @Body() body: { quantity: number },
    @Req() req: Request,
  ) {
    const userId = req?.user?.id as string;
    const result = await this.productService.refillStock(
      userId,
      variantId,
      body.quantity,
    );
    return {
      message: 'Stock refilled successfully',
      data: result,
    };
  }

  @Delete('/variant/:variantId')
  @Auth('seller')
  async removeVariant(
    @Param('variantId') variantId: string,
    @Req() req: Request,
  ) {
    const userId = req?.user?.id as string;
    return await this.productService.removeVariant(variantId, userId);
  }
}
