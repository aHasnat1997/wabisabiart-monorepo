import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@wabisabiart/db';
import {
  ChangeSellerPasswordDto,
  SubmitAuthenticityDto,
  UpdatePlatformFeeDto,
  UpdateSellerProfileDto,
  UpdateSellerStoreDto,
} from './dto/seller-settings.dto.js';
import { UserRole } from '@wabisabiart/db';
import bcrypt from 'bcrypt';
import { EventEmitter2 } from '@nestjs/event-emitter';

type SellerProfileUpdatePayload = {
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  marketingEmailsEnabled?: boolean;
};

type SellerStoreUpdatePayload = {
  shopName?: string;
  shopDescription?: string;
  shopAnnouncement?: string;
  address?: string;
  shopLogo?: string;
  shopBannerImage?: string;
  shopPolicies?: string;
  returnPolicy?: string;
  privacyPolicy?: string;
  shippingPolicy?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
};

type AuthenticityPayload = {
  shopName: string;
  shopDescription: string;
  address: string;
  shopLogo?: string;
  shopBannerImage?: string;
  proofOfIdentity: string;
  sampleProducts?: string[];
  isAgreedToTermsAndConditions: true;
  isHandcraftedOrEthicallySourced: true;
};

type PasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type FeeConfigRecord = {
  key: string;
  platformFeePercent: number;
  paymentProcessingPercent: number;
  paymentProcessingFlat: number;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type PlatformFeeSettingDelegate = {
  upsert: (args: {
    where: { key: string };
    create: {
      key: string;
      platformFeePercent: number;
      paymentProcessingPercent: number;
      paymentProcessingFlat: number;
    };
    update: Record<string, never>;
  }) => Promise<FeeConfigRecord>;
  update: (args: {
    where: { key: string };
    data: {
      platformFeePercent?: number;
      paymentProcessingPercent?: number;
      paymentProcessingFlat?: number;
      notes?: string;
    };
  }) => Promise<FeeConfigRecord>;
};

type PrismaWithFeeSetting = PrismaService & {
  platformFeeSetting: PlatformFeeSettingDelegate;
};

@Injectable()
export class SellerSettingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private get db(): PrismaWithFeeSetting {
    return this.prisma as PrismaWithFeeSetting;
  }

  private async getOrCreatePlatformFeeConfig() {
    return this.db.platformFeeSetting.upsert({
      where: { key: 'default' },
      create: {
        key: 'default',
        platformFeePercent: 5,
        paymentProcessingPercent: 2.9,
        paymentProcessingFlat: 0.3,
      },
      update: {},
    });
  }

  async getSellerSettingsOverview(userId: string) {
    const [user, feeConfig] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId, role: UserRole.seller },
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          avatarUrl: true,
          marketingEmailsEnabled: true,
          twoFactorEnabled: true,
          otpProvider: true,
          lastLoginAt: true,
          createdAt: true,
          sellerProfile: true,
          shopSetupRequest: true,
        },
      }),
      this.getOrCreatePlatformFeeConfig(),
    ]);

    if (!user) {
      throw new NotFoundException('Seller not found');
    }

    return {
      profile: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatarUrl: user.avatarUrl,
        marketingEmailsEnabled: user.marketingEmailsEnabled,
        createdAt: user.createdAt,
      },
      store: user.sellerProfile,
      authenticity: {
        sellerProfile: user.sellerProfile,
        request: user.shopSetupRequest,
      },
      security: {
        twoFactorEnabled: user.twoFactorEnabled,
        otpProvider: user.otpProvider,
        lastLoginAt: user.lastLoginAt,
      },
      billingAndFees: {
        ...feeConfig,
        sellerKeepsPercent: 100 - Number(feeConfig.platformFeePercent),
      },
    };
  }

  async updateSellerProfile(userId: string, dto: UpdateSellerProfileDto) {
    const payload = dto as SellerProfileUpdatePayload;

    const seller = await this.prisma.user.findUnique({
      where: { id: userId, role: UserRole.seller },
      select: { id: true },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(payload.fullName !== undefined
          ? { fullName: payload.fullName }
          : {}),
        ...(payload.phoneNumber !== undefined
          ? { phoneNumber: payload.phoneNumber }
          : {}),
        ...(payload.avatarUrl !== undefined
          ? { avatarUrl: payload.avatarUrl }
          : {}),
        ...(payload.marketingEmailsEnabled !== undefined
          ? { marketingEmailsEnabled: payload.marketingEmailsEnabled }
          : {}),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        avatarUrl: true,
        marketingEmailsEnabled: true,
        updatedAt: true,
      },
    });
  }

  async updateSellerStore(userId: string, dto: UpdateSellerStoreDto) {
    const payload = dto as SellerStoreUpdatePayload;

    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!sellerProfile) {
      throw new NotFoundException('Approved seller profile not found');
    }

    return this.prisma.sellerProfile.update({
      where: { userId },
      data: {
        ...(payload.shopName !== undefined
          ? { shopName: payload.shopName }
          : {}),
        ...(payload.shopDescription !== undefined
          ? { shopDescription: payload.shopDescription }
          : {}),
        ...(payload.shopAnnouncement !== undefined
          ? { shopAnnouncement: payload.shopAnnouncement }
          : {}),
        ...(payload.address !== undefined ? { address: payload.address } : {}),
        ...(payload.shopLogo !== undefined
          ? { shopLogo: payload.shopLogo }
          : {}),
        ...(payload.shopBannerImage !== undefined
          ? { shopBannerImage: payload.shopBannerImage }
          : {}),
        ...(payload.shopPolicies !== undefined
          ? { shopPolicies: payload.shopPolicies }
          : {}),
        ...(payload.returnPolicy !== undefined
          ? { returnPolicy: payload.returnPolicy }
          : {}),
        ...(payload.privacyPolicy !== undefined
          ? { privacyPolicy: payload.privacyPolicy }
          : {}),
        ...(payload.shippingPolicy !== undefined
          ? { shippingPolicy: payload.shippingPolicy }
          : {}),
        ...(payload.facebookUrl !== undefined
          ? { facebookUrl: payload.facebookUrl }
          : {}),
        ...(payload.instagramUrl !== undefined
          ? { instagramUrl: payload.instagramUrl }
          : {}),
        ...(payload.twitterUrl !== undefined
          ? { twitterUrl: payload.twitterUrl }
          : {}),
        ...(payload.websiteUrl !== undefined
          ? { websiteUrl: payload.websiteUrl }
          : {}),
      },
    });
  }

  async getAuthenticityStatus(userId: string) {
    const seller = await this.prisma.user.findUnique({
      where: { id: userId, role: UserRole.seller },
      select: {
        id: true,
        sellerProfile: true,
        shopSetupRequest: true,
      },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    return seller;
  }

  async submitAuthenticity(userId: string, dto: SubmitAuthenticityDto) {
    const payload = dto as AuthenticityPayload;

    const seller = await this.prisma.user.findUnique({
      where: { id: userId, role: UserRole.seller },
      select: {
        id: true,
        sellerProfile: {
          select: { id: true, isVerifiedByAdmin: true },
        },
      },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    if (seller.sellerProfile?.isVerifiedByAdmin) {
      throw new BadRequestException('Shop is already approved for this seller');
    }

    return this.prisma.shopSetupRequest.upsert({
      where: { userId },
      create: {
        userId,
        ...payload,
        status: 'pending',
      },
      update: {
        ...payload,
        status: 'pending',
        reviewNote: null,
        reviewedAt: null,
        reviewedByAdminId: null,
      },
    }).then((req) => {
      this.eventEmitter.emit('shop.pending_approval', {
        shopName: payload.shopName,
        sellerId: userId,
      });
      return req;
    });
  }

  async getSecuritySettings(userId: string) {
    const seller = await this.prisma.user.findUnique({
      where: { id: userId, role: UserRole.seller },
      select: {
        id: true,
        email: true,
        twoFactorEnabled: true,
        otpProvider: true,
        emailVerified: true,
        phoneVerified: true,
        lastLoginAt: true,
      },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    return seller;
  }

  async changeSellerPassword(userId: string, dto: ChangeSellerPasswordDto) {
    const payload = dto as PasswordPayload;

    const seller = await this.prisma.user.findUnique({
      where: { id: userId, role: UserRole.seller },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    const isMatch = await bcrypt.compare(
      payload.currentPassword,
      seller.passwordHash,
    );
    if (!isMatch) {
      throw new BadRequestException('Current password is invalid');
    }

    const isSamePassword = await bcrypt.compare(
      payload.newPassword,
      seller.passwordHash,
    );

    if (isSamePassword) {
      throw new BadRequestException("Don't use old password!");
    }

    const newHashedPassword = await bcrypt.hash(payload.newPassword, 10);

    await this.prisma.user.update({
      where: { id: seller.id },
      data: { passwordHash: newHashedPassword },
    });

    return { success: true };
  }

  async getSellerBillingAndFees() {
    const feeConfig = await this.getOrCreatePlatformFeeConfig();

    return {
      ...feeConfig,
      sellerKeepsPercent: 100 - Number(feeConfig.platformFeePercent),
    };
  }

  async getAdminBillingAndFees() {
    return await this.getSellerBillingAndFees();
  }

  async updateAdminBillingAndFees(dto: UpdatePlatformFeeDto) {
    const payload = dto as {
      platformFeePercent?: number;
      paymentProcessingPercent?: number;
      paymentProcessingFlat?: number;
      notes?: string;
    };

    await this.getOrCreatePlatformFeeConfig();

    const updated = await this.db.platformFeeSetting.update({
      where: { key: 'default' },
      data: {
        ...(payload.platformFeePercent !== undefined
          ? { platformFeePercent: payload.platformFeePercent }
          : {}),
        ...(payload.paymentProcessingPercent !== undefined
          ? { paymentProcessingPercent: payload.paymentProcessingPercent }
          : {}),
        ...(payload.paymentProcessingFlat !== undefined
          ? { paymentProcessingFlat: payload.paymentProcessingFlat }
          : {}),
        ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
      },
    });

    this.eventEmitter.emit('billing.updated');

    return {
      ...updated,
      sellerKeepsPercent: 100 - Number(updated.platformFeePercent),
    };
  }
}
