import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  Put,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service.js';
import { Auth } from '../../../src/decorators/auth.decorator.js';
import {
  QueryBuilder,
  ParsedQuery,
} from '../../../src/decorators/query-builder.decorator.js';
import { UserRole } from '@wabisabiart/db';
import {
  CreateWishlistCollectionDto,
  UpdateWishlistCollectionDto,
  AddToWishlistDto,
} from './dto/wishlist.dto.js';
import type { Request } from 'express';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  // ─────────────────────────────────────────────────────────────────────────
  // COLLECTION ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * POST /wishlist/collection
   * Create a new wishlist collection (favourite list)
   */
  @Post('collection')
  @Auth(UserRole.customer)
  async createCollection(
    @Req() req: Request,
    @Body() dto: CreateWishlistCollectionDto,
  ) {
    const userId = req.user?.id as string;
    return await this.wishlistService.createCollection(userId, dto);
  }

  /**
   * GET /wishlist/collections
   * Get all wishlist collections for customer
   */
  @Get('collections')
  @Auth(UserRole.customer)
  async getCollections(@Req() req: Request) {
    const userId = req.user?.id as string;
    const data = await this.wishlistService.getCollections(userId);
    return data;
  }

  /**
   * GET /wishlist/collection
   * Get all customer's wishlist collections (alias for /collections)
   */
  @Get('collection')
  @Auth(UserRole.customer)
  async getAllCollections(@Req() req: Request) {
    const userId = req.user?.id as string;
    const data = await this.wishlistService.getCollections(userId);
    return data;
  }

  /**
   * GET /wishlist/collection/:collectionId
   * Get a specific collection with all its items
   */
  @Get('collection/:collectionId')
  @Auth(UserRole.customer)
  async getCollection(
    @Req() req: Request,
    @Param('collectionId') collectionId: string,
  ) {
    const userId = req.user?.id as string;
    return await this.wishlistService.getCollection(userId, collectionId);
  }

  /**
   * PATCH /wishlist/collection/:collectionId
   * Update a wishlist collection
   */
  @Patch('collection/:collectionId')
  @Auth(UserRole.customer)
  async updateCollection(
    @Req() req: Request,
    @Param('collectionId') collectionId: string,
    @Body() dto: UpdateWishlistCollectionDto,
  ) {
    const userId = req.user?.id as string;
    return await this.wishlistService.updateCollection(
      userId,
      collectionId,
      dto,
    );
  }

  /**
   * DELETE /wishlist/collection/:collectionId
   * Delete a wishlist collection
   */
  @Delete('collection/:collectionId')
  @Auth(UserRole.customer)
  async deleteCollection(
    @Req() req: Request,
    @Param('collectionId') collectionId: string,
  ) {
    const userId = req.user?.id as string;
    await this.wishlistService.deleteCollection(userId, collectionId);
    return { message: 'Wishlist collection deleted successfully' };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // WISHLIST ITEMS ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * POST /wishlist/item
   * Add a product to a wishlist collection
   */
  @Post('item')
  @Auth(UserRole.customer)
  async addToWishlist(@Req() req: Request, @Body() dto: AddToWishlistDto) {
    const userId = req.user?.id as string;
    const data = await this.wishlistService.addToWishlist(userId, dto);
    return {
      message: 'Product added to wishlist successfully',
      data,
    };
  }

  /**
   * GET /wishlist/categories
   * Get all wishlist categories for customer
   */
  @Get('categories')
  @Auth(UserRole.customer)
  async getWishlistCategories(@Req() req: Request) {
    const userId = req.user?.id as string;
    const data = await this.wishlistService.getWishlistCategories(userId);
    return {
      message: 'Wishlist categories fetched successfully',
      data,
    };
  }

  /**
   * PUT /wishlist/item/:wishlistItemId
   * Move an item to a different wishlist collection
   */
  @Put('item/:wishlistItemId')
  @Auth(UserRole.customer)
  async moveItemToWishlist(
    @Req() req: Request,
    @Param('wishlistItemId') wishlistItemId: string,
    @Body('wishlistId') wishlistId: string,
  ) {
    const userId = req.user?.id as string;
    await this.wishlistService.moveItemToWishlist(
      userId,
      wishlistItemId,
      wishlistId,
    );
    return { message: 'Product moved to different wishlist successfully' };
  }

  /**
   * DELETE /wishlist/item/:wishlistItemId
   * Remove an item from a wishlist
   */
  @Delete('item/:wishlistItemId')
  @Auth(UserRole.customer)
  async removeFromWishlist(
    @Req() req: Request,
    @Param('wishlistItemId') wishlistItemId: string,
  ) {
    const userId = req.user?.id as string;
    await this.wishlistService.removeFromWishlist(userId, wishlistItemId);
    return { message: 'Product removed from wishlist successfully' };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // WISHLIST ITEMS WITH QUERY_BUILDER
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /wishlist/items
   * Get all wishlist items and collections with advanced filtering
   * Query params:
   *   - type=Items|Collections (default: Items)
   *   - id=<wishlistId|collectionId> (filter by specific collection/id)
   *   - page, limit, sort, order
   *   - q=search term
   *   - filter[fieldName]=value
   *
   * Examples:
   * - /wishlist/items?type=Items&id=<collectionId>&page=1&limit=10
   * - /wishlist/items?type=Collections&page=1&limit=5
   * - /wishlist/items?type=Items&q=search&sort=addedAt&order=desc
   */
  @Get('items')
  @Auth(UserRole.customer)
  async getWishlistItems(
    @Req() req: Request,
    @QueryBuilder<Record<string, any>>({
      searchFields: ['product.title'],
      defaultSort: { field: 'addedAt', order: 'desc' },
      defaultLimit: 10,
      maxLimit: 100,
    })
    query: ParsedQuery & { page: number; limit: number },
  ) {
    const userId = req.user?.id as string;

    // Extract type and id from query for easier filtering
    const type = (
      Object.keys(query.where).includes('type') ? query.where.type : 'Items'
    ) as string;
    const id = (
      Object.keys(query.where).includes('id') ? query.where.id : undefined
    ) as string | undefined;

    // Rebuild query.where with type and id for service
    query.where = {
      ...query.where,
      ...(type && { type }),
      ...(id && { id }),
    };

    const data = await this.wishlistService.getWishlistItems(userId, query);
    return {
      message: 'Wishlist items fetched successfully',
      data,
    };
  }
}
