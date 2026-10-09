import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateReviewDto, SellerRespondReviewDto } from './dto/review.dto.js';
import { PrismaService } from '@wabisabiart/db';
import { Prisma } from '@wabisabiart/db';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class ReviewService {
  private readonly algorithm = 'aes-256-cbc';
  // Fallback to a 32-byte key generated from JWT_SECRET for safety
  private readonly secretKey = crypto
    .createHash('sha256')
    .update(process.env.JWT_SECRET || '')
    .digest();
  private readonly iv = crypto.randomBytes(16);

  constructor(private readonly prisma: PrismaService) {}

  // Encrypt sensitive access tokens
  private encrypt(text: string): string {
    const cipher = crypto.createCipheriv(
      this.algorithm,
      this.secretKey,
      this.iv,
    );
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${this.iv.toString('hex')}:${encrypted}`;
  }

  // -------------------------------------------------------
  // Customer Reviews
  // -------------------------------------------------------
  async create(userId: string, createReviewDto: CreateReviewDto) {
    const { productId, orderId } = createReviewDto;

    const existingReview = await this.prisma.review.findFirst({
      where: { productId, userId },
      select: { id: true },
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this product');
    }

    // Check if user has purchased this product
    const purchaseQuery: Prisma.OrderWhereInput = {
      buyerId: userId,
      items: {
        some: {
          productId,
        },
      },
    };

    // If orderId is provided, scope the check to that specific order
    if (orderId) {
      purchaseQuery.id = orderId;
    }

    const verifiedOrder = await this.prisma.order.findFirst({
      where: purchaseQuery,
      select: { id: true },
    });

    const result = await this.prisma.review.create({
      data: {
        ...createReviewDto,
        userId,
        verifiedPurchase: !!verifiedOrder,
      },
      select: {
        id: true,
        comment: true,
        rating: true,
        images: true,
        createdAt: true,
        verifiedPurchase: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return result;
  }

  async findAllReviewForProduct(productId: string) {
    const result = await this.prisma.review.findMany({
      where: {
        productId,
      },
      select: {
        id: true,
        comment: true,
        rating: true,
        images: true,
        createdAt: true,
        verifiedPurchase: true,
        sellerResponse: true,
        sellerRespondedAt: true,
        platform: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    return result;
  }

  // -------------------------------------------------------
  // Seller Reviews
  // -------------------------------------------------------
  async sellerRespondToReview(
    sellerUserId: string,
    respondDto: SellerRespondReviewDto,
  ) {
    const review = await this.prisma.review.findUnique({
      where: { id: respondDto.reviewId },
      select: { productId: true },
    });

    if (!review) {
      throw new ConflictException('Review not found');
    }

    // Verify that the seller owns the product
    const product = await this.prisma.product.findUnique({
      where: { id: review.productId },
      select: { seller: { select: { id: true } } },
    });

    if (product?.seller?.id !== sellerUserId) {
      throw new ConflictException(
        'You do not have permission to respond to this review',
      );
    }

    const result = await this.prisma.review.update({
      where: { id: respondDto.reviewId },
      data: {
        sellerResponse: respondDto.sellerResponse,
        sellerRespondedAt: new Date(),
      },
      select: {
        id: true,
        sellerResponse: true,
        sellerRespondedAt: true,
      },
    });

    return result;
  }

  // Generate OAuth validation string URL
  async getShopifyAuthUrl(
    shop: string,
    sellerProfileId: string,
  ): Promise<string> {
    const apiKey = process.env.SHOPIFY_API_KEY;
    const redirectUri = `${process.env.APP_URL}/api/v1/review/callback/shopify`;
    const scopes = 'read_products'; // Adjust scopes to match required application privileges

    return `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${redirectUri}&state=${sellerProfileId}`;
  }

  // Swap authorization code for a permanent access token
  async handleShopifyCallback(
    code: string,
    shop: string,
    sellerProfileId: string,
  ) {
    try {
      const response = await axios.post(
        `https://${shop}/admin/oauth/access_token`,
        {
          client_id: process.env.SHOPIFY_API_KEY,
          client_secret: process.env.SHOPIFY_API_SECRET,
          code,
        },
      );

      const encryptedToken = this.encrypt(response.data.access_token);

      await this.prisma.externalStoreConnection.upsert({
        where: {
          sellerProfileId_platform: { sellerProfileId, platform: 'SHOPIFY' },
        },
        update: { accessToken: encryptedToken, shopDomain: shop },
        create: {
          sellerProfileId,
          platform: 'SHOPIFY',
          shopDomain: shop,
          accessToken: encryptedToken,
        },
      });

      // Trigger your first background data aggregation batch here!
    } catch (error) {
      throw new BadRequestException(
        'Failed to exchange Shopify authentication token',
      );
    }
  }
}
