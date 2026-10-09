import { Injectable } from '@nestjs/common';
import type { Prisma } from '@wabisabiart/db';
import { CreateCategoryDto, CreateSubCategoryDto } from './dto/category.dto.js';
import { PrismaService } from '@wabisabiart/db';
import { ParsedQuery } from '../../../src/decorators/query-builder.decorator.js';

const productInclude = {
  seller: {
    select: { id: true, email: true, fullName: true, avatarUrl: true },
  },
  variants: true,
  category: true,
  subCategory: true,
} as const;

type ProductWithInclude = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

type ProductWithPricing = ProductWithInclude & {
  finalPrice: string;
  totalQuantity: number;
};

type ProductWithExtras = ProductWithPricing & {
  isWishlist: boolean;
};

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly productInclude = productInclude;

  private shuffle<T>(items: T[]) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  private async attachWishlistStatus(
    products: ProductWithPricing[],
    userId?: string,
  ): Promise<ProductWithExtras[]>;
  private async attachWishlistStatus(
    products: ProductWithPricing,
    userId?: string,
  ): Promise<ProductWithExtras>;
  private async attachWishlistStatus(
    products: ProductWithPricing | ProductWithPricing[],
    userId?: string,
  ): Promise<ProductWithExtras | ProductWithExtras[]> {
    if (!userId) {
      const attach = (product: ProductWithPricing): ProductWithExtras => ({
        ...product,
        isWishlist: false,
      });
      return Array.isArray(products) ? products.map(attach) : attach(products);
    }

    const wishlistedItems = await this.prisma.wishlistItem.findMany({
      where: { wishlist: { userId } },
      select: { productId: true },
    });

    const wishlistedProductIds = new Set(
      wishlistedItems.map((item) => item.productId),
    );

    const attach = (product: ProductWithPricing): ProductWithExtras => ({
      ...product,
      isWishlist: wishlistedProductIds.has(product.id),
    });

    return Array.isArray(products) ? products.map(attach) : attach(products);
  }

  private async attachExtra(
    products: ProductWithInclude[],
    userId?: string,
  ): Promise<ProductWithExtras[]>;
  private async attachExtra(
    products: ProductWithInclude,
    userId?: string,
  ): Promise<ProductWithExtras>;
  private async attachExtra(
    products: ProductWithInclude | ProductWithInclude[],
    userId?: string,
  ): Promise<ProductWithExtras | ProductWithExtras[]> {
    const attach = (product: ProductWithInclude): ProductWithPricing => {
      const price = Number(product.price ?? 0);
      const discountValue = Number(product.discountValue ?? 0);
      const discount =
        product.discountType === 'percentage'
          ? (discountValue / 100) * price
          : product.discountType === 'fixed_amount'
            ? discountValue
            : 0;

      return {
        ...product,
        finalPrice: (price - discount).toFixed(2),
        totalQuantity: product.variants.reduce(
          (sum, variant) => sum + variant.quantity,
          0,
        ),
      };
    };

    if (Array.isArray(products)) {
      return this.attachWishlistStatus(products.map(attach), userId);
    }

    return this.attachWishlistStatus(attach(products), userId);
  }

  private async getRandomProductsForCategory(
    categoryId: string,
    excludeIds: string[],
    take: number,
  ): Promise<ProductWithInclude[]> {
    if (take <= 0) return [];

    const candidates = await this.prisma.product.findMany({
      where: {
        categoryId,
        status: 'active',
        deletedAt: null,
        ...(excludeIds.length ? { id: { notIn: excludeIds } } : {}),
      },
      include: this.productInclude,
    });

    return this.shuffle(candidates).slice(0, take);
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const result = await this.prisma.category.create({
      data: createCategoryDto,
    });
    return result;
  }

  async createSubCategory(data: CreateSubCategoryDto) {
    await this.prisma.subCategory.create({
      data,
    });

    return true;
  }

  async findAll() {
    const result = await this.prisma.category.findMany({
      include: {
        _count: { select: { subCategories: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return result.map(({ _count, ...category }) => ({
      ...category,
      totalSubCategories: _count.subCategories,
    }));
  }

  async findOne(id: string) {
    const result = await this.prisma.category.findUnique({
      where: { id },
      include: { subCategories: { orderBy: { createdAt: 'desc' } } },
    });

    if (!result) return null;

    const subCategoriesWithImages = await Promise.all(
      result.subCategories.map(async (subCat) => {
        const latestVariant = await this.prisma.productVariant.findFirst({
          where: {
            product: {
              subCategoryId: subCat.id,
              status: 'active',
              deletedAt: null,
            },
            mediaUrl: { not: 'placeholders/image-placeholder.png' },
          },
          orderBy: { createdAt: 'desc' },
          select: { mediaUrl: true },
        });

        return {
          ...subCat,
          imageUrl: latestVariant?.mediaUrl || process.env.DEFAULT_IMAGE_URL,
        };
      }),
    );

    return {
      ...result,
      subCategories: subCategoriesWithImages,
    };
  }

  async featuredCategoryToggle(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return await this.prisma.category.update({
      where: { id },
      data: { isFeatured: !category.isFeatured },
    });
  }

  async goodForGiftCategoryToggle(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    const data: Prisma.CategoryUpdateInput = {
      isGoodForGift: !category.isGoodForGift,
    };

    return await this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async allFeaturedCategory() {
    const result = await this.prisma.category.findMany({
      where: {
        isFeatured: true,
      },
      include: { subCategories: { orderBy: { createdAt: 'desc' } } },
    });

    return Promise.all(
      result.map(async (category) => {
        const subCategoriesWithImages = await Promise.all(
          category.subCategories.map(async (subCat) => {
            const latestVariant = await this.prisma.productVariant.findFirst({
              where: {
                product: {
                  subCategoryId: subCat.id,
                  status: 'active',
                  deletedAt: null,
                },
                mediaUrl: { not: 'placeholders/image-placeholder.png' },
              },
              orderBy: { createdAt: 'desc' },
              select: { mediaUrl: true },
            });

            return {
              ...subCat,
              imageUrl:
                latestVariant?.mediaUrl || process.env.DEFAULT_IMAGE_URL,
            };
          }),
        );

        return {
          ...category,
          subCategories: subCategoriesWithImages[0].imageUrl,
        };
      }),
    );
  }

  async featuredCategoriesWithProducts(userId?: string) {
    const categories = await this.prisma.category.findMany({
      where: { isFeatured: true, isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        description: true,
        isFeatured: true,
      },
    });

    if (!categories.length) return [];

    const soldByProduct = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
    });

    const soldMap = new Map<string, number>(
      soldByProduct.map((p) => [p.productId, p._sum.quantity ?? 0]),
    );

    let soldProducts: ProductWithInclude[] = [];
    if (soldByProduct.length) {
      const soldProductIds = soldByProduct.map((p) => p.productId);
      soldProducts = await this.prisma.product.findMany({
        where: {
          id: { in: soldProductIds },
          categoryId: { in: categories.map((c) => c.id) },
          status: 'active',
          deletedAt: null,
        },
        include: this.productInclude,
      });
    }

    const productsByCategory = new Map<string, ProductWithInclude[]>();
    for (const product of soldProducts) {
      const { categoryId } = product;
      if (!categoryId) continue;
      const existing = productsByCategory.get(categoryId) ?? [];
      existing.push(product);
      productsByCategory.set(categoryId, existing);
    }

    return Promise.all(
      categories.map(async (category) => {
        const soldProductsForCategory: ProductWithInclude[] =
          productsByCategory.get(category.id) ?? [];

        soldProductsForCategory.sort(
          (a: ProductWithInclude, b: ProductWithInclude) => {
            const aSold = soldMap.get(a.id) ?? 0;
            const bSold = soldMap.get(b.id) ?? 0;
            return bSold - aSold;
          },
        );

        const topProducts = soldProductsForCategory.slice(0, 20);
        let finalProducts = topProducts;

        if (finalProducts.length < 20) {
          const randomProducts = await this.getRandomProductsForCategory(
            category.id,
            finalProducts.map((product) => product.id),
            20 - finalProducts.length,
          );
          finalProducts = [...finalProducts, ...randomProducts];
        }

        const productsWithExtra = await this.attachExtra(finalProducts, userId);

        return {
          ...category,
          products: productsWithExtra,
        };
      }),
    );
  }

  async goodForGiftCategories(userId?: string) {
    const categories = await this.prisma.category.findMany({
      where: { isGoodForGift: true, isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        description: true,
        isGoodForGift: true,
      },
    });

    return Promise.all(
      categories.map(async (category) => {
        const latestProduct = await this.prisma.product.findFirst({
          where: {
            categoryId: category.id,
            status: 'active',
            deletedAt: null,
          },
          orderBy: { createdAt: 'desc' },
          include: this.productInclude,
        });

        if (!latestProduct) {
          return {
            ...category,
            product: null,
            latestVariantImage: null,
          };
        }

        const latestVariant = await this.prisma.productVariant.findFirst({
          where: {
            productId: latestProduct.id,
            isActive: true,
            mediaUrl: { not: 'placeholders/image-placeholder.png' },
          },
          orderBy: { createdAt: 'desc' },
          select: { mediaUrl: true },
        });

        const productWithExtra = await this.attachExtra(latestProduct, userId);

        return {
          ...category,
          product: productWithExtra,
          latestVariantImage:
            latestVariant?.mediaUrl ?? process.env.DEFAULT_IMAGE_URL ?? null,
        };
      }),
    );
  }

  async removeCategory(id: string) {
    const isCategory = await this.prisma.category.findUnique({
      where: {
        id,
      },
    });
    if (!isCategory) {
      throw new Error('Category not found');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.subCategory.deleteMany({
        where: {
          categoryId: isCategory.id,
        },
      });

      const category = await tx.category.delete({
        where: {
          id,
        },
      });

      return { category };
    });

    return result;
  }

  async removeSubCategory(id: string) {
    await this.prisma.subCategory.delete({
      where: {
        id,
      },
    });

    return true;
  }

  async bestSellingCategories(
    query: ParsedQuery & { page: number; limit: number },
  ) {
    const limit = query.limit ?? 10;
    const offset = (query.page - 1) * limit;

    // Step 1: group OrderItems by productId and sum quantities sold
    const soldByProduct = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
    });

    if (!soldByProduct.length) {
      return {
        meta: { page: query.page, limit: query.limit, total: 0, totalPage: 0 },
        data: [],
      };
    }

    // Step 2: fetch categoryId for each sold product
    const productIds = soldByProduct.map((p) => p.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        categoryId: { not: null },
        deletedAt: null,
      },
      select: { id: true, categoryId: true },
    });

    // Step 3: aggregate total sold per categoryId in JS
    const soldMap = new Map(
      soldByProduct.map((p) => [p.productId, p._sum.quantity ?? 0]),
    );
    const categoryTotals = new Map<string, number>();
    for (const product of products) {
      if (!product.categoryId) continue;
      const prev = categoryTotals.get(product.categoryId) ?? 0;
      categoryTotals.set(product.categoryId, prev + soldMap.get(product.id)!);
    }

    // Step 4: sort by total sold desc, paginate
    const rankedIds = [...categoryTotals.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    const total = rankedIds.length;
    const pagedIds = rankedIds.slice(offset, offset + limit);

    if (!pagedIds.length) {
      return {
        meta: {
          page: query.page,
          limit: query.limit,
          total,
          totalPage: Math.ceil(total / query.limit),
        },
        data: [],
      };
    }

    // Step 5: fetch categories with top 20 products each
    const categories = await this.prisma.category.findMany({
      where: { id: { in: pagedIds }, isActive: true, ...query.where },
      select: {
        id: true,
        name: true,
        type: true,
        description: true,
        isFeatured: true,
        createdAt: true,
        products: {
          where: { status: 'active', deletedAt: null },
          orderBy: { salesCount: 'desc' },
          take: 20,
          select: {
            id: true,
            title: true,
            subtitle: true,
            price: true,
            discountType: true,
            discountValue: true,
            salesCount: true,
            averageRating: true,
            favoriteCount: true,
            badge: true,
            tags: true,
            variants: {
              where: { isActive: true },
              take: 1,
              select: { mediaUrl: true },
            },
          },
        },
      },
    });

    // Preserve ranking order
    const ordered = pagedIds
      .map((id) => categories.find((c) => c.id === id))
      .filter(Boolean);

    return {
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPage: Math.ceil(total / query.limit),
      },
      data: ordered,
    };
  }
}
