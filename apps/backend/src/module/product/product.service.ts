import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateProductDto,
  UpdateProductDetailsDto,
  UpdateProductVariantDto,
} from './dto/product.dto.js';
import { PrismaService } from '@wabisabiart/db';
import {
  executeQuery,
  ParsedQuery,
} from '../../../src/decorators/query-builder.decorator.js';
import { ProductStatus } from '@wabisabiart/db';
import { NotificationService } from '../notification/notification.service.js';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Add this method to ProductService
  private async attachWishlistStatus<T extends Record<string, any>>(
    products: T | T[],
    userId?: string,
  ): Promise<T | T[]> {
    if (!userId) {
      const attach = (product: T) => ({
        ...product,
        isWishlist: false,
      });
      return Array.isArray(products) ? products.map(attach) : attach(products);
    }

    const wishlistedItems = await this.prisma.wishlistItem.findMany({
      where: {
        wishlist: { userId },
      },
      select: { productId: true },
    });

    const wishlistedProductIds = new Set(
      wishlistedItems.map((item) => item.productId),
    );

    const attach = (product: T) => ({
      ...product,
      isWishlist: wishlistedProductIds.has(product.id as string),
    });

    return Array.isArray(products) ? products.map(attach) : attach(products);
  }

  // Modify existing attachExtra to call this
  private async attachExtra<T extends Record<string, any>>(
    products: T | T[],
    userId?: string,
  ) {
    const attach = (product: T) => ({
      ...product,
      finalPrice: (
        product.price -
        (product.discountType === 'percentage'
          ? (product.discountValue / 100) * product.price
          : product.discountType === 'fixed_amount'
            ? product.discountValue
            : 0)
      ).toFixed(2),
      totalQuantity:
        (product.variants as { quantity: number }[] | undefined)?.reduce(
          (sum, v) => sum + v.quantity,
          0,
        ) ?? 0,
    });

    const productsWithExtra = Array.isArray(products)
      ? products.map(attach)
      : attach(products);

    return this.attachWishlistStatus(productsWithExtra, userId);
  }

  async create(createProductDto: CreateProductDto, userId: string) {
    const { variants, ...product } = createProductDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user || user.role !== 'seller') {
      throw new BadRequestException('Seller not found');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const createProduct = await tx.product.create({
        data: { ...product, sellerId: user.id },
      });

      const createVariants = variants?.length
        ? await Promise.all(
            variants.map((variant) =>
              tx.productVariant.create({
                data: {
                  ...variant,
                  productId: createProduct.id,
                  options:
                    variant.options === null ? undefined : variant.options,
                },
              }),
            ),
          )
        : [];

      return { createProduct, createVariants };
    });

    this.eventEmitter.emit('product.pending_review', {
      productTitle: result.createProduct.title,
      productId: result.createProduct.id,
    });

    return {
      ...result.createProduct,
      variants: result.createVariants,
    };
  }

  async findAllPendingReview(
    query: ParsedQuery & { page: number; limit: number },
  ) {
    const allActiveProducts = {
      ...query,
      where: { ...query.where, status: 'pending_review' },
    };
    const response = await executeQuery(this.prisma.product, allActiveProducts);
    return {
      ...response,
      data: await this.attachExtra(response.data),
    };
  }

  async changeProductStatus(id: string, status: ProductStatus) {
    if (status === ProductStatus.active) {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: {
          seller: {
            include: {
              sellerProfile: true,
            },
          },
        },
      });

      if (!product) {
        throw new BadRequestException('Product not found');
      }

      if (
        !product.seller.sellerProfile ||
        !product.seller.sellerProfile.isVerifiedByAdmin
      ) {
        throw new BadRequestException(
          'Seller shop must be approved before activating products',
        );
      }
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: { status },
      select: { id: true, title: true, sellerId: true },
    });

    if (status === ProductStatus.active) {
      this.eventEmitter.emit('product.approved', {
        sellerId: updated.sellerId,
        productTitle: updated.title,
        productId: updated.id,
      });
    } else if (status === ProductStatus.inactive) {
      this.eventEmitter.emit('product.rejected', {
        sellerId: updated.sellerId,
        productTitle: updated.title,
        productId: updated.id,
      });
    }

    return updated;
  }

  async addVariant(
    userId: string,
    productId: string,
    variant: UpdateProductVariantDto,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { seller: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.sellerId !== userId) {
      throw new Error('User is not allowed to add variant to this product');
    }

    return await this.prisma.productVariant.create({
      data: {
        productId: product.id,
        name: variant.name,
        quantity: variant.quantity,
        isActive: variant.isActive,
        mediaUrl: variant.mediaUrl,
        options: variant.options ? variant.options : [],
      },
    });
  }

  async refillStock(userId: string, variantId: string, quantity: number) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant) {
      throw new Error('Variant not found');
    }

    if (variant.product.sellerId !== userId) {
      throw new Error('User does not have permission to update this variant');
    }

    return await this.prisma.productVariant.update({
      where: { id: variantId },
      data: { quantity },
    });
  }

  async findAll(
    query: ParsedQuery & { page: number; limit: number },
    userId?: string,
  ) {
    const allActiveProducts = {
      ...query,
      where: { ...query.where, status: 'active' },
    };
    const response = await executeQuery(this.prisma.product, allActiveProducts);
    return {
      ...response,
      data: await this.attachExtra(response.data, userId),
    };
  }

  async findAllBestDeals(
    query: ParsedQuery & { page: number; limit: number },
    userId?: string,
  ) {
    const allActiveProducts = {
      ...query,
      where: {
        ...query.where,
        status: 'active',
        discountType: { in: ['percentage', 'fixed_amount'] },
        discountValue: { gt: 0 },
      },
    };
    const response = await executeQuery(this.prisma.product, allActiveProducts);
    return {
      ...response,
      data: await this.attachExtra(response.data, userId),
    };
  }

  async myListingStatus(userId: string) {
    const [
      totalProducts,
      activeProducts,
      draftProducts,
      pendingReviewProducts,
      lowStockProducts,
    ] = await Promise.all([
      this.prisma.product.count({
        where: { sellerId: userId },
      }),
      this.prisma.product.count({
        where: { sellerId: userId, status: 'active' },
      }),
      this.prisma.product.count({
        where: { sellerId: userId, status: 'draft' },
      }),
      this.prisma.product.count({
        where: { sellerId: userId, status: 'pending_review' },
      }),
      this.prisma.product.count({
        where: {
          sellerId: userId,
          variants: {
            some: { isLowStock: true },
          },
        },
      }),
    ]);

    return {
      totalProducts,
      activeProducts,
      pendingReviewProducts,
      draftProducts,
      lowStockProducts,
    };
  }

  async sellerProducts(
    userId: string,
    query: ParsedQuery & { page: number; limit: number },
  ) {
    const queryWithSeller = {
      ...query,
      where: { ...query.where, sellerId: userId },
    };
    const response = await executeQuery(this.prisma.product, queryWithSeller);
    return {
      ...response,
      data: await this.attachExtra(response.data, userId),
    };
  }

  async findOne(id: string, userId?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
            sellerProfile: {
              select: {
                id: true,
                shopName: true,
                shopLogo: true,
                shopDescription: true,
                address: true,
                totalSales: true,
                totalReviews: true,
                averageRating: true,
              },
            },
          },
        },
        variants: true,
        category: true,
        subCategory: true,
      },
    });

    if (!product) return null;

    return this.attachExtra(product, userId);
  }

  async updateProductDetails(
    productId: string,
    userId: string,
    UpdateProductDetailsDto: UpdateProductDetailsDto,
  ) {
    if (!productId) throw new Error('Product id is required');
    const { ...product } = UpdateProductDetailsDto;

    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (!sellerProfile) {
      throw new Error('User does not have a seller profile');
    }

    const productFromDB = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!productFromDB) {
      throw new Error('Product not found');
    }

    if (productFromDB.sellerId !== sellerProfile.userId) {
      throw new Error('User does not have permission to update this product');
    }

    const result = await this.prisma.product.update({
      where: { id: productId },
      data: product,
    });

    return result;
  }

  async remove(productId: string, userId: string) {
    if (!productId) throw new Error('Product id is required');
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (userId !== product?.sellerId) {
      throw new Error('User does not have permission to delete this product');
    }

    if (product?.variants?.length) {
      await this.prisma.productVariant.deleteMany({
        where: { productId: product.id },
      });
    }

    return this.prisma.product.delete({
      where: { id: productId },
    });
  }

  async removeVariant(variantId: string, userId: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant) {
      throw new Error('Variant not found');
    }

    if (variant.product.sellerId !== userId) {
      throw new Error('User does not have permission to update this variant');
    }

    return this.prisma.productVariant.delete({
      where: { id: variant.id },
    });
  }
}
