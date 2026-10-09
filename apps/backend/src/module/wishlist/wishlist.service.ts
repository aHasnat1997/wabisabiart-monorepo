import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@wabisabiart/db';
import {
  CreateWishlistCollectionDto,
  UpdateWishlistCollectionDto,
  AddToWishlistDto,
  WishlistCollectionResponse,
  WishlistCollectionWithItemsResponse,
  WishlistItemResponse,
  PaginatedWishlistResponse,
} from './dto/wishlist.dto.js';
import type { ParsedQuery } from '../../../src/decorators/query-builder.decorator.js';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────
  // WISHLIST COLLECTION OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Create a new wishlist collection for a customer
   */
  async createCollection(
    userId: string,
    dto: CreateWishlistCollectionDto,
  ): Promise<WishlistCollectionResponse> {
    const wishlist = await this.prisma.wishlist.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        isPublic: dto.isPublic ?? false,
      },
    });

    return this.formatCollectionResponse(wishlist);
  }

  /**
   * Update a wishlist collection
   */
  async updateCollection(
    userId: string,
    collectionId: string,
    dto: UpdateWishlistCollectionDto,
  ): Promise<WishlistCollectionResponse> {
    // Verify ownership
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { id: collectionId },
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist collection not found');
    }

    if (wishlist.userId !== userId) {
      throw new BadRequestException(
        'You can only edit your own wishlist collections',
      );
    }

    const updated = await this.prisma.wishlist.update({
      where: { id: collectionId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && {
          description: dto.description,
        }),
        ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
      },
    });

    return this.formatCollectionResponse(updated);
  }

  /**
   * Delete a wishlist collection and move its items to the default wishlist
   */
  async deleteCollection(userId: string, collectionId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const wishlist = await tx.wishlist.findUnique({
        where: { id: collectionId },
      });

      if (!wishlist) {
        throw new NotFoundException('Wishlist collection not found');
      }

      if (wishlist.userId !== userId) {
        throw new BadRequestException(
          'You can only delete your own wishlist collections',
        );
      }

      let defaultWishlist = await tx.wishlist.findFirst({
        where: { userId, name: 'My Wishlist' },
      });

      if (!defaultWishlist || defaultWishlist.id === collectionId) {
        defaultWishlist = await tx.wishlist.create({
          data: {
            userId,
            name: 'My Wishlist',
            description: 'Default wishlist',
            isPublic: false,
          },
        });
      }

      const existingItems = await tx.wishlistItem.findMany({
        where: { wishlistId: defaultWishlist.id },
        select: { productId: true },
      });

      const existingProductIds = existingItems.map((item) => item.productId);
      if (existingProductIds.length > 0) {
        await tx.wishlistItem.deleteMany({
          where: {
            wishlistId: collectionId,
            productId: { in: existingProductIds },
          },
        });
      }

      await tx.wishlistItem.updateMany({
        where: { wishlistId: collectionId },
        data: { wishlistId: defaultWishlist.id },
      });

      await tx.wishlist.delete({
        where: { id: collectionId },
      });
    });
  }

  /**
   * Get all collections for a customer
   */
  async getCollections(userId: string): Promise<WishlistCollectionResponse[]> {
    const wishlistsWithCount = await this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return wishlistsWithCount.map((w) => ({
      id: w.id,
      userId: w.userId,
      name: w.name,
      description: w.description || undefined,
      isPublic: w.isPublic,
      itemCount: w.items.length,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    }));
  }

  /**
   * Get a single collection with all its items
   */
  async getCollection(
    userId: string,
    collectionId: string,
  ): Promise<WishlistCollectionWithItemsResponse> {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { id: collectionId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                description: true,
                price: true,
                currency: true,
                discountType: true,
                discountValue: true,
                badge: true,
                categoryId: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                createdAt: true,
                variants: {
                  select: {
                    mediaUrl: true,
                  },
                  take: 1,
                },
              },
            },
          },
          orderBy: { addedAt: 'desc' },
        },
      },
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist collection not found');
    }

    if (wishlist.userId !== userId) {
      throw new BadRequestException(
        'You can only view your own wishlist collections',
      );
    }

    return {
      id: wishlist.id,
      userId: wishlist.userId,
      name: wishlist.name,
      description: wishlist.description || undefined,
      isPublic: wishlist.isPublic,
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
      items: wishlist.items.map((item) =>
        this.formatWishlistItem({
          id: item.id,
          wishlistId: item.wishlistId,
          productId: item.productId,
          note: item.note,
          addedAt: item.addedAt,
          product: item.product as any as {
            id: string;
            title: string | null;
            description: string | null;
            price: { toString(): string } | null;
            currency: string;
            discountType: string;
            discountValue: { toString(): string } | null;
            badge: string | null;
            categoryId: string | null;
            category: { id: string; name: string } | null;
            createdAt: Date;
            variants: Array<{ mediaUrl: string | null }>;
          },
        }),
      ),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // WISHLIST ITEM OPERATIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Add a product to a wishlist collection
   */
  async addToWishlist(
    userId: string,
    dto: AddToWishlistDto,
  ): Promise<WishlistItemResponse> {
    let wishlistId = dto.wishlistId;

    // If no wishlistId provided, get or create default wishlist
    if (!wishlistId) {
      let defaultWishlist = await this.prisma.wishlist.findFirst({
        where: { userId, name: 'My Wishlist' },
      });

      if (!defaultWishlist) {
        defaultWishlist = await this.prisma.wishlist.create({
          data: {
            userId,
            name: 'My Wishlist',
            description: 'Default wishlist',
            isPublic: false,
          },
        });
      }
      wishlistId = defaultWishlist.id;
    }

    // Verify wishlist ownership
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { id: wishlistId },
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist collection not found');
    }

    if (wishlist.userId !== userId) {
      throw new BadRequestException(
        'You can only add items to your own wishlists',
      );
    }

    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if item already exists in wishlist
    const existingItem = await this.prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlistId,
          productId: dto.productId,
        },
      },
    });

    if (existingItem) {
      throw new BadRequestException('This product is already in your wishlist');
    }

    // Add item
    const item = await this.prisma.wishlistItem.create({
      data: {
        wishlistId: wishlistId,
        productId: dto.productId,
        note: dto.note,
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            currency: true,
            discountType: true,
            discountValue: true,
            badge: true,
            categoryId: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            createdAt: true,
            variants: {
              select: {
                mediaUrl: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    // Update product favorite count
    await this.prisma.product.update({
      where: { id: dto.productId },
      data: { favoriteCount: { increment: 1 } },
    });

    return this.formatWishlistItem({
      id: item.id,
      wishlistId: item.wishlistId,
      productId: item.productId,
      note: item.note,
      addedAt: item.addedAt,
      product: item.product as any as {
        id: string;
        title: string | null;
        description: string | null;
        price: { toString(): string } | null;
        currency: string;
        discountType: string;
        discountValue: { toString(): string } | null;
        badge: string | null;
        categoryId: string | null;
        category: { id: string; name: string } | null;
        createdAt: Date;
        variants: Array<{ mediaUrl: string | null }>;
      },
    });
  }

  async getWishlistCategories(
    userId: string,
  ): Promise<Array<{ id: string; name: string; productCount: number }>> {
    const items = await this.prisma.wishlistItem.findMany({
      where: {
        wishlist: { userId },
      },
      include: {
        product: {
          select: {
            categoryId: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Group by category
    const categoryMap = new Map<
      string,
      { id: string; name: string; count: number }
    >();

    items.forEach((item) => {
      if (item.product.category) {
        const catId = item.product.category.id;
        if (categoryMap.has(catId)) {
          categoryMap.get(catId)!.count++;
        } else {
          categoryMap.set(catId, {
            id: item.product.category.id,
            name: item.product.category.name,
            count: 1,
          });
        }
      }
    });

    return Array.from(categoryMap.values()).map((cat) => ({
      id: cat.id,
      name: cat.name,
      productCount: cat.count,
    }));
  }

  /**
   * Move an item from a wishlist collection to another wishlist collection
   */
  async moveItemToWishlist(
    userId: string,
    wishlistItemId: string,
    wishlistId: string,
  ) {
    // Get the item
    const item = await this.prisma.wishlistItem.findUnique({
      where: { id: wishlistItemId },
      include: {
        wishlist: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Wishlist item not found');
    }

    if (item.wishlist.userId !== userId) {
      throw new BadRequestException(
        'You can only move items from your own wishlists',
      );
    }

    const target = await this.prisma.wishlist.findUnique({
      where: { id: wishlistId },
    });
    if (!target || target.userId !== userId) {
      throw new BadRequestException('Invalid wishlist or unauthorized access');
    }

    const duplicate = await this.prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: { wishlistId, productId: item.productId },
      },
    });
    if (duplicate) {
      throw new BadRequestException('This product is already in that wishlist');
    }

    await this.prisma.wishlistItem.update({
      where: { id: item.id },
      data: { wishlistId },
    });
  }

  /**
   * Remove an item from a wishlist
   */
  async removeFromWishlist(
    userId: string,
    wishlistItemId: string,
  ): Promise<void> {
    // Get the item
    const item = await this.prisma.wishlistItem.findUnique({
      where: { id: wishlistItemId },
      include: {
        wishlist: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Wishlist item not found');
    }

    if (item.wishlist.userId !== userId) {
      throw new BadRequestException(
        'You can only remove items from your own wishlists',
      );
    }

    // Delete item
    await this.prisma.wishlistItem.delete({
      where: { id: wishlistItemId },
    });

    // Update product favorite count
    await this.prisma.product.update({
      where: { id: item.productId },
      data: { favoriteCount: { decrement: 1 } },
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // WISHLIST ITEMS WITH QUERY-BUILDER
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get all wishlist items and collections with QueryBuilder support
   * Supports filtering by:
   * - type=Items|Collections
   * - id=<wishlistId|collectionId>
   * - search across product titles
   * - pagination, sorting, etc.
   */
  async getWishlistItems(
    userId: string,
    query: ParsedQuery & { page: number; limit: number },
  ): Promise<PaginatedWishlistResponse> {
    const type = (query.where?.type as string | undefined) || 'Items';

    // Extract id and handle it separately (QueryBuilder adds 'contains' which doesn't work for UUID)
    let id: string | undefined;
    if (query.where?.id) {
      if (typeof query.where.id === 'string') {
        id = query.where.id;
      } else if (
        typeof query.where.id === 'object' &&
        'contains' in query.where.id
      ) {
        id = query.where.id.contains as string;
      }
    }

    // Extract categoryId and handle it separately (QueryBuilder adds 'contains' which doesn't work for UUID)
    let categoryId: string | undefined;
    if (query.where?.categoryId) {
      if (typeof query.where.categoryId === 'string') {
        categoryId = query.where.categoryId;
      } else if (
        typeof query.where.categoryId === 'object' &&
        'contains' in query.where.categoryId
      ) {
        categoryId = query.where.categoryId.contains as string;
      }
    }

    const skip = query.skip || 0;
    const take = query.take || 10;

    // For "Items" type - get all wishlist items
    if (type === 'Items') {
      // Get specific collection items if id is provided
      if (id) {
        // Verify collection ownership
        const wishlist = await this.prisma.wishlist.findUnique({
          where: { id },
        });

        if (!wishlist || wishlist.userId !== userId) {
          throw new BadRequestException(
            'Invalid wishlist or unauthorized access',
          );
        }

        const total = await this.prisma.wishlistItem.count({
          where: {
            wishlistId: id,
            ...(categoryId && {
              product: {
                categoryId: categoryId,
              },
            }),
          },
        });

        const items = (await this.prisma.wishlistItem.findMany({
          where: {
            wishlistId: id,
            ...(categoryId && {
              product: {
                categoryId: categoryId,
              },
            }),
          },
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                currency: true,
                badge: true,
                categoryId: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                variants: {
                  select: {
                    mediaUrl: true,
                  },
                  take: 1,
                },
              },
            },
          },
          skip,
          take,
          orderBy: query.orderBy || { addedAt: 'desc' },
        })) as unknown as Array<{
          id: string;
          note: string | null;
          addedAt: Date;
          wishlistId: string;
          productId: string;
          product: {
            id: string;
            title: string | null;
            price: { toString(): string } | null;
            currency: string;
            badge: string | null;
            categoryId: string | null;
            category: { id: string; name: string } | null;
            variants: Array<{ mediaUrl: string | null }>;
          };
        }>;

        return {
          items: items.map((item) => ({
            id: item.id,
            type: 'Items' as const,
            product: {
              id: item.product.id,
              title: item.product.title || undefined,
              price: item.product.price?.toString(),
              imageUrl: item.product.variants[0]?.mediaUrl || undefined,
              category: item.product.category || undefined,
            },
            note: item.note || undefined,
            addedAt: item.addedAt,
          })),
          page: query.page,
          limit: query.limit,
          total,
        };
      } else {
        // Get all wishlist items for user
        const total = await this.prisma.wishlistItem.count({
          where: {
            wishlist: { userId },
            ...(categoryId && {
              product: {
                categoryId: categoryId,
              },
            }),
          },
        });

        const items = (await this.prisma.wishlistItem.findMany({
          where: {
            wishlist: { userId },
            ...(categoryId && {
              product: {
                categoryId: categoryId,
              },
            }),
          },
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                currency: true,
                badge: true,
                categoryId: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                variants: {
                  select: {
                    mediaUrl: true,
                  },
                  take: 1,
                },
              },
            },
          },
          skip,
          take,
          orderBy: query.orderBy || { addedAt: 'desc' },
        })) as unknown as Array<{
          id: string;
          note: string | null;
          addedAt: Date;
          wishlistId: string;
          productId: string;
          product: {
            id: string;
            title: string | null;
            price: { toString(): string } | null;
            currency: string;
            badge: string | null;
            categoryId: string | null;
            category: { id: string; name: string } | null;
            variants: Array<{ mediaUrl: string | null }>;
          };
        }>;

        return {
          items: items.map((item) => ({
            id: item.id,
            type: 'Items' as const,
            product: {
              id: item.product.id,
              title: item.product.title || undefined,
              price: item.product.price?.toString(),
              imageUrl: item.product.variants[0]?.mediaUrl || undefined,
              category: item.product.category || undefined,
            },
            note: item.note || undefined,
            addedAt: item.addedAt,
          })),
          page: query.page,
          limit: query.limit,
          total,
        };
      }
    }

    // For "Collections" type - get all collections
    if (type === 'Collections') {
      if (id) {
        // Get specific collection
        const wishlist = await this.prisma.wishlist.findUnique({
          where: { id },
          include: {
            items: true,
          },
        });

        if (!wishlist || wishlist.userId !== userId) {
          throw new BadRequestException(
            'Invalid collection or unauthorized access',
          );
        }

        return {
          items: [
            {
              id: wishlist.id,
              type: 'Collections' as const,
              name: wishlist.name,
              description: wishlist.description || undefined,
              isPublic: wishlist.isPublic,
              itemCount: wishlist.items.length,
              createdAt: wishlist.createdAt,
              updatedAt: wishlist.updatedAt,
            },
          ],
          page: 1,
          limit: 1,
          total: 1,
        };
      } else {
        // Get all collections for user
        const total = await this.prisma.wishlist.count({
          where: { userId },
        });

        const collections = await this.prisma.wishlist.findMany({
          where: { userId },
          include: {
            items: true,
          },
          skip,
          take,
          orderBy: query.orderBy || { createdAt: 'desc' },
        });

        return {
          items: collections.map((w) => ({
            id: w.id,
            type: 'Collections' as const,
            name: w.name,
            description: w.description || undefined,
            isPublic: w.isPublic,
            itemCount: w.items.length,
            createdAt: w.createdAt,
            updatedAt: w.updatedAt,
          })),
          page: query.page,
          limit: query.limit,
          total,
        };
      }
    }

    // Default fallback
    return {
      items: [],
      page: 1,
      limit: 10,
      total: 0,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────

  private formatCollectionResponse(wishlist: {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): WishlistCollectionResponse {
    return {
      id: wishlist.id,
      userId: wishlist.userId,
      name: wishlist.name,
      description: wishlist.description || undefined,
      isPublic: wishlist.isPublic,
      itemCount: 0,
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
    };
  }

  private formatWishlistItem(item: {
    id: string;
    wishlistId: string;
    productId: string;
    note: string | null;
    addedAt: Date;
    product: {
      id: string;
      title: string | null;
      description: string | null;
      price: { toString(): string } | null;
      currency: string;
      discountType: string;
      discountValue: { toString(): string } | null;
      badge: string | null;
      categoryId: string | null;
      category: { id: string; name: string } | null;
      createdAt: Date;
      variants: Array<{ mediaUrl: string | null }>;
    };
  }): WishlistItemResponse {
    return {
      id: item.id,
      wishlistId: item.wishlistId,
      productId: item.productId,
      note: item.note || undefined,
      addedAt: item.addedAt,
      product: {
        id: item.product.id,
        title: item.product.title || undefined,
        description: item.product.description || undefined,
        price: item.product.price?.toString(),
        currency: item.product.currency,
        discountType: item.product.discountType,
        discountValue: item.product.discountValue?.toString(),
        badge: item.product.badge || undefined,
        imageUrl: item.product.variants[0]?.mediaUrl || undefined,
        categoryId: item.product.categoryId || undefined,
        category: item.product.category || undefined,
        createdAt: item.product.createdAt,
      },
    };
  }
}
