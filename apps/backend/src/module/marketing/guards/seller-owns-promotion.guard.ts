/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@wabisabiart/db';

@Injectable()
export class SellerOwnsPromotionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const id = request.params?.id;

    if (!id) {
      return true;
    }

    const userId = request.user?.id;
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!sellerProfile) {
      throw new BadRequestException('Seller profile not found');
    }

    const promotion = await (this.prisma as any).promotion.findFirst({
      where: {
        id,
        sellerId: sellerProfile.id,
      },
    });

    if (!promotion) {
      throw new ForbiddenException('You do not own this promotion');
    }

    return true;
  }
}
