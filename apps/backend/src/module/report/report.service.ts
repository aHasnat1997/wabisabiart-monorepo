import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@wabisabiart/db';
import { EmailService } from '../../services/email.service.js';
import { CreateReportDto, ApproveReportDto } from './dto/report.dto.js';
import { EventEmitter2 } from '@nestjs/event-emitter';

const PRODUCT_INACTIVE_THRESHOLD = 3;
const SHOP_FREEZE_THRESHOLD = 5;

@Injectable()
export class ReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createReport(userId: string, dto: CreateReportDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, deletedAt: null },
    });

    if (!product) throw new NotFoundException('Product not found');

    const existing = await this.prisma.report.findFirst({
      where: { reporterId: userId, productId: dto.productId },
    });

    if (existing) throw new ConflictException('You have already reported this product');

    const report = await this.prisma.report.create({
      data: {
        reporterId: userId,
        reportedUserId: product.sellerId,
        productId: dto.productId,
        reason: dto.reason,
        description: dto.description,
      },
    });

    this.eventEmitter.emit('report.created', {
      productTitle: product.title,
      reportId: report.id,
    });

    return report;
  }

  async adminListReports() {
    return this.prisma.report.findMany({
      include: {
        reporter: { select: { id: true, fullName: true, email: true } },
        reportedUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            sellerProfile: { select: { id: true, shopName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async adminGetReport(reportId: string) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
      include: {
        reporter: { select: { id: true, fullName: true, email: true } },
        reportedUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            sellerProfile: { select: { id: true, shopName: true } },
          },
        },
      },
    });

    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async adminApproveReport(reportId: string, adminId: string, dto: ApproveReportDto) {
    const report = await this.adminGetReport(reportId);

    if (report.status !== 'pending') {
      throw new BadRequestException('Report is already reviewed');
    }

    await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'approved',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        resolution: dto.resolution,
      },
    });

    // Increment product reportCount
    const updatedProduct = await this.prisma.product.update({
      where: { id: report.productId },
      data: { reportCount: { increment: 1 } },
    });

    // Fetch seller info separately
    const seller = await this.prisma.user.findUnique({
      where: { id: updatedProduct.sellerId },
      select: {
        email: true,
        fullName: true,
        sellerProfile: { select: { id: true, shopName: true } },
      },
    });

    // Auto inactive product if threshold reached
    if (
      updatedProduct.reportCount >= PRODUCT_INACTIVE_THRESHOLD &&
      updatedProduct.status === 'active'
    ) {
      await this.prisma.product.update({
        where: { id: report.productId },
        data: { status: 'inactive' },
      });
    }

    // Check if shop should be frozen
    if (seller?.sellerProfile) {
      const inactiveCount = await this.prisma.product.count({
        where: {
          sellerId: updatedProduct.sellerId,
          status: 'inactive',
          deletedAt: null,
        },
      });

      if (inactiveCount >= SHOP_FREEZE_THRESHOLD) {
        await this.prisma.sellerProfile.update({
          where: { id: seller.sellerProfile.id },
          data: { isActive: false },
        });
        this.eventEmitter.emit('shop.frozen', {
          sellerId: updatedProduct.sellerId,
          shopName: seller.sellerProfile.shopName ?? 'Your Shop',
        });
      }
    }

    // Send warning email to seller
    if (seller) {
      await this.emailService.sendEmail({
        to: seller.email,
        subject: `⚠️ Warning: Your product has been reported`,
        templateName: 'shop-warning',
        context: {
          sellerName: seller.fullName,
          shopName: seller.sellerProfile?.shopName ?? 'Your Shop',
          productTitle: updatedProduct.title ?? 'Your Product',
          reportReason: report.reason,
          reportDescription: report.description,
          resolution: dto.resolution,
          reportCount: updatedProduct.reportCount,
          productInactiveThreshold: PRODUCT_INACTIVE_THRESHOLD,
          shopFreezeThreshold: SHOP_FREEZE_THRESHOLD,
          isProductInactive: updatedProduct.reportCount >= PRODUCT_INACTIVE_THRESHOLD,
        },
      });
    }

    return { message: 'Report approved and seller has been notified' };
  }

  async adminRejectReport(reportId: string, adminId: string) {
    const report = await this.adminGetReport(reportId);

    if (report.status !== 'pending') {
      throw new BadRequestException('Report is already reviewed');
    }

    return this.prisma.report.update({
      where: { id: reportId },
      data: { status: 'rejected', reviewedBy: adminId, reviewedAt: new Date() },
    });
  }

  async adminForceProductInactive(productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });

    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.product.update({
      where: { id: productId },
      data: { status: 'inactive' },
    });
  }

  async adminFreezeShop(shopId: string) {
    const shop = await this.prisma.sellerProfile.findUnique({
      where: { id: shopId },
      include: { user: { select: { id: true } } },
    });

    if (!shop) throw new NotFoundException('Shop not found');

    const updated = await this.prisma.sellerProfile.update({
      where: { id: shopId },
      data: { isActive: false },
    });

    this.eventEmitter.emit('shop.frozen', {
      sellerId: shop.user.id,
      shopName: shop.shopName ?? 'Your Shop',
    });

    return updated;
  }

  async adminUnfreezeShop(shopId: string) {
    const shop = await this.prisma.sellerProfile.findUnique({
      where: { id: shopId },
      include: { user: { select: { id: true } } },
    });

    if (!shop) throw new NotFoundException('Shop not found');

    const updated = await this.prisma.sellerProfile.update({
      where: { id: shopId },
      data: { isActive: true },
    });

    this.eventEmitter.emit('shop.unfrozen', {
      sellerId: shop.user.id,
      shopName: shop.shopName ?? 'Your Shop',
    });

    return updated;
  }
}
