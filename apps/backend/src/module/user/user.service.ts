import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto.js';
import { PrismaService } from '@wabisabiart/db';
import { EmailService } from '../../../src/services/email.service.js';
import { OTPProvider, OTPService } from '../../../src/services/otp.service.js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import {
  OtpProvider,
  UserRole,
} from '@wabisabiart/db';
import { ShopSetupDto } from './dto/shop-setup.dto.js';
import {
  UpdateSellerProfileDto,
  UpdateUserProfileDto,
} from './dto/user-profile.dto.js';
import { TTokenPayload } from '../../types/token.type.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly stayLoggedInDurationInSeconds = 30 * 24 * 60 * 60;
  private readonly jwtSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private emailService: EmailService,
    private otpService: OTPService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.jwtSecret = this.configService.getOrThrow<string>('JWT_SECRET');
  }

  private readonly adminShopSelect = {
    id: true,
    email: true,
    fullName: true,
    avatarUrl: true,
    createdAt: true,
    sellerProfile: {
      select: {
        id: true,
        shopName: true,
        shopDescription: true,
        address: true,
        shopLogo: true,
        shopBannerImage: true,
        proofOfIdentity: true,
        sampleProducts: true,
        isVerified: true,
        isFeatured: true,
        isVerifiedByAdmin: true,
        verificationDate: true,
        createdAt: true,
      },
    },
    shopSetupRequest: {
      select: {
        id: true,
        shopName: true,
        shopDescription: true,
        address: true,
        shopLogo: true,
        shopBannerImage: true,
        proofOfIdentity: true,
        sampleProducts: true,
        isAgreedToTermsAndConditions: true,
        isHandcraftedOrEthicallySourced: true,
        status: true,
        reviewNote: true,
        reviewedAt: true,
        reviewedByAdminId: true,
        createdAt: true,
        updatedAt: true,
      },
    },
  } as const;

  private getRememberUntil(stayLoggedIn: boolean): number | undefined {
    if (!stayLoggedIn) {
      return undefined;
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return nowInSeconds + this.stayLoggedInDurationInSeconds;
  }

  async create(createUserDto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const result = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        passwordHash,
        fullName: createUserDto.fullName,
        role: createUserDto.role as UserRole,
      },
    });

    if (result) {
      await this.emailService.sendEmail({
        to: result.email,
        subject: 'Welcome to our platform 🛒',
        templateName: 'welcome-mail',
        context: {
          companyName: 'WabiSaviArt',
          clientName: result.fullName,
          verifyEmailUrl: process.env.VERIFY_EMAIL_URL_WEBHOOKS,
        },
        attachments: [
          {
            filename: 'logo-white.svg',
            path: path.join(process.cwd(), 'public', 'logo-white.svg'),
            cid: 'logo@wabisaviart',
          },
        ],
      });
    }

    return result;
  }

  async sendEmailOTP(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('User not found!');

    return await this.otpService.sendOTP({
      provider: 'email',
      recipient: email,
      userName: user.fullName,
      purpose: 'email verification',
    });
  }

  async verifyEmailOTP(email: string, otp: string) {
    await this.otpService.verifyOTP({
      provider: 'email',
      recipient: email,
      otp,
    });
    const user = await this.prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });

    const tokenPayload: TTokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      stayLoggedIn: false,
      rememberUntil: this.getRememberUntil(false),
    };

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.jwtSecret,
      expiresIn: '7d',
    });

    return {
      accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        twoFactorProvider: user.otpProvider,
        createdAt: user.createdAt,
      },
    };
  }

  async sendPhoneOTP(phoneNumber: string, email: string) {
    const user = await this.prisma.user.findFirst({ where: { email } });
    if (!user) throw new BadRequestException('User not found!');

    if (!user.phoneNumber) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { phoneNumber },
      });
    }

    return await this.otpService.sendOTP({
      provider: 'phone',
      recipient: phoneNumber,
      userName: user.fullName,
      purpose: 'phone verification',
    });
  }

  async verifyPhoneOTP(phoneNumber: string, otp: string) {
    await this.otpService.verifyOTP({
      provider: 'phone',
      recipient: phoneNumber,
      otp,
    });

    const user = await this.prisma.user.findFirst({ where: { phoneNumber } });
    if (!user) throw new BadRequestException('User not found!');

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { phoneNumber, phoneVerified: true },
    });

    const tokenPayload: TTokenPayload = {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      stayLoggedIn: false,
      rememberUntil: this.getRememberUntil(false),
    };

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.jwtSecret,
      expiresIn: '7d',
    });

    return {
      accessToken,
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
        emailVerified: updatedUser.emailVerified,
        phoneVerified: updatedUser.phoneVerified,
        twoFactorEnabled: updatedUser.twoFactorEnabled,
        twoFactorProvider: updatedUser.otpProvider,
        createdAt: updatedUser.createdAt,
      },
    };
  }

  async sendTwoFactorOTP({
    userId,
    otpProvider,
  }: {
    userId: string;
    otpProvider: 'email' | 'phone';
  }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found!');

    if (otpProvider === 'phone' && !user.phoneNumber) {
      throw new BadRequestException(
        'Phone number not added. Please add phone number.',
      );
    }

    const recipient = otpProvider === 'email' ? user.email : user.phoneNumber!;
    return await this.otpService.sendOTP({
      provider: otpProvider,
      recipient,
      userName: user.fullName,
      purpose: 'two-factor authentication',
    });
  }

  async enableTwoFactorAuth({
    userId,
    otpProvider,
    otp,
  }: {
    userId: string;
    otpProvider: 'email' | 'phone';
    otp: string;
  }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found!');

    if (otpProvider === 'phone' && !user.phoneNumber) {
      throw new BadRequestException(
        'Phone number not added. Please add phone number.',
      );
    }

    const recipient = otpProvider === 'email' ? user.email : user.phoneNumber!;
    await this.otpService.verifyOTP({ provider: otpProvider, recipient, otp });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true,
        otpProvider:
          otpProvider === 'email' ? OtpProvider.email : OtpProvider.phone,
      },
    });

    return { message: 'Two-factor authentication enabled successfully 👍' };
  }

  async disableTwoFactorAuth({ userId, otp }: { userId: string; otp: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found!');

    if (user.twoFactorEnabled && user.otpProvider) {
      if (user.otpProvider === OtpProvider.phone && !user.phoneNumber) {
        throw new BadRequestException(
          'Phone number not added. Please add phone number.',
        );
      }

      const recipient =
        user.otpProvider === OtpProvider.email ? user.email : user.phoneNumber!;
      await this.otpService.verifyOTP({
        provider: user.otpProvider as OTPProvider,
        recipient,
        otp,
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: false },
    });
    return { message: 'Two-factor authentication disabled successfully 👍' };
  }

  async findAll() {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        fullName: true,
        avatarUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
        fullName: true,
        dob: true,
        avatarUrl: true,
        createdAt: true,
        role: true,
        isActive: true,
        twoFactorEnabled: true,
        otpProvider: true,
        emailVerified: true,
        phoneVerified: true,
        sellerProfile: {
          select: {
            id: true,
            shopName: true,
            createdAt: true,
            isVerified: true,
            isVerifiedByAdmin: true,
            verificationDate: true,
          },
        },
        shopSetupRequest: {
          select: {
            id: true,
            shopName: true,
            status: true,
            reviewNote: true,
            reviewedAt: true,
            createdAt: true,
          },
        },
      },
    });
    return user;
  }

  async updateProfile(userId: string, dto: UpdateUserProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found!');

    const payload = dto as {
      fullName?: string;
      dob?: string | null;
      avatarUrl?: string;
    };

    const dobValue =
      payload.dob !== undefined
        ? payload.dob
          ? new Date(payload.dob)
          : null
        : undefined;

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(payload.fullName !== undefined
          ? { fullName: payload.fullName }
          : {}),
        ...(dobValue !== undefined ? { dob: dobValue } : {}),
        ...(payload.avatarUrl !== undefined
          ? { avatarUrl: payload.avatarUrl }
          : {}),
      },
      select: {
        id: true,
        fullName: true,
        dob: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });
  }

  async getPublicShopDetails(shopId: string) {
    const shop = await this.prisma.sellerProfile.findFirst({
      where: {
        id: shopId,
        isActive: true,
        isVerifiedByAdmin: true,
      },
      select: {
        id: true,
        shopName: true,
        shopDescription: true,
        shopAnnouncement: true,
        shopBannerImage: true,
        shopLogo: true,
        address: true,
        shopPolicies: true,
        returnPolicy: true,
        privacyPolicy: true,
        shippingPolicy: true,
        totalSales: true,
        totalReviews: true,
        averageRating: true,
        facebookUrl: true,
        instagramUrl: true,
        twitterUrl: true,
        websiteUrl: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        followers: {
          select: {
            id: true,
            userId: true,
            followedAt: true,
          },
        },
        announcements: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            title: true,
            content: true,
            startsAt: true,
            expiresAt: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        shopJournals: {
          where: {
            published: true,
            approved: true,
          },
          select: {
            id: true,
            title: true,
            bannerImage: true,
            shortExcerpt: true,
            content: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!shop) {
      throw new BadRequestException('Shop not found or not active');
    }

    const products = await this.prisma.product.findMany({
      where: {
        sellerId: shop.user.id,
        status: 'active',
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        subtitle: true,
        description: true,
        price: true,
        discountType: true,
        discountValue: true,
        badge: true,
        averageRating: true,
        salesCount: true,
        favoriteCount: true,
        isFeatured: true,
        createdAt: true,
        variants: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            mediaUrl: true,
            quantity: true,
            options: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      ...shop,
      products,
    };
  }

  async updateSellerProfile(userId: string, dto: UpdateSellerProfileDto) {
    const seller = await this.prisma.user.findUnique({
      where: { id: userId, role: UserRole.seller },
      select: { id: true },
    });

    if (!seller) throw new BadRequestException('Seller not found!');

    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!sellerProfile) {
      throw new BadRequestException('Approved seller profile not found');
    }

    const payload = dto as {
      shopName?: string;
      shopDescription?: string;
      shopBannerImage?: string;
      shopLogo?: string;
      address?: string;
      shopPolicies?: string;
      returnPolicy?: string;
      privacyPolicy?: string;
      shippingPolicy?: string;
      facebookUrl?: string;
      instagramUrl?: string;
      twitterUrl?: string;
      websiteUrl?: string;
    };

    return this.prisma.sellerProfile.update({
      where: { userId },
      data: {
        ...(payload.shopName !== undefined
          ? { shopName: payload.shopName }
          : {}),
        ...(payload.shopDescription !== undefined
          ? { shopDescription: payload.shopDescription }
          : {}),
        ...(payload.shopBannerImage !== undefined
          ? { shopBannerImage: payload.shopBannerImage }
          : {}),
        ...(payload.shopLogo !== undefined
          ? { shopLogo: payload.shopLogo }
          : {}),
        ...(payload.address !== undefined ? { address: payload.address } : {}),
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

  async setupShop(userId: string, payload: ShopSetupDto) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, role: UserRole.seller },
    });
    if (!user) throw new BadRequestException('Seller not found!');

    const existingShop = await this.prisma.sellerProfile.findUnique({
      where: { userId },
    });

    if (existingShop) {
      throw new BadRequestException('Shop already approved for this seller');
    }

    const shopRequest = (await this.prisma.shopSetupRequest.upsert({
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
    })) as {
      id: string;
      userId: string;
      shopName: string;
      status: 'pending' | 'approved' | 'rejected';
      createdAt: Date;
      updatedAt: Date;
    };

    return shopRequest;
  }

  async adminShopList() {
    return this.prisma.user.findMany({
      where: {
        role: UserRole.seller,
        OR: [
          { sellerProfile: { isNot: null } },
          { shopSetupRequest: { isNot: null } },
        ],
      },
      select: this.adminShopSelect,
      orderBy: [{ updatedAt: 'desc' }],
    });
  }

  async adminShopDetail(sellerId: string) {
    const seller = await this.prisma.user.findFirst({
      where: {
        id: sellerId,
        role: UserRole.seller,
        OR: [
          { sellerProfile: { isNot: null } },
          { shopSetupRequest: { isNot: null } },
        ],
      },
      select: this.adminShopSelect,
    });

    if (!seller) {
      throw new BadRequestException('Shop request not found for this seller');
    }

    return seller;
  }

  async setFeaturedShop(sellerId: string, isFeatured: boolean) {
    const seller = await this.prisma.user.findFirst({
      where: { id: sellerId, role: UserRole.seller },
      select: {
        id: true,
        sellerProfile: true,
      },
    });

    if (!seller || !seller.sellerProfile) {
      throw new BadRequestException('Approved shop not found for this seller');
    }

    await this.prisma.sellerProfile.update({
      where: { userId: seller.id },
      data: { isFeatured },
    });

    if (isFeatured) {
      this.eventEmitter.emit('shop.featured', {
        sellerId: seller.id,
        shopName: (seller.sellerProfile as any).shopName ?? 'Your Shop',
      });
    }

    return this.adminShopDetail(seller.id);
  }

  async featuredShopList() {
    return this.prisma.sellerProfile.findMany({
      where: {
        isFeatured: true,
        isActive: true,
        isVerifiedByAdmin: true,
      },
      select: {
        id: true,
        userId: true,
        shopName: true,
        shopDescription: true,
        address: true,
        shopLogo: true,
        shopBannerImage: true,
        totalSales: true,
        totalReviews: true,
        averageRating: true,
        isFeatured: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [{ updatedAt: 'desc' }],
    });
  }

  async approveShopRequest(sellerId: string, adminId: string) {
    const seller = await this.prisma.user.findFirst({
      where: { id: sellerId, role: UserRole.seller },
      select: {
        id: true,
        sellerProfile: true,
        shopSetupRequest: true,
      },
    });

    if (!seller) {
      throw new BadRequestException('Seller not found!');
    }

    if (!seller.shopSetupRequest) {
      throw new BadRequestException('Shop request not found for this seller');
    }

    const setupRequest = seller.shopSetupRequest as {
      shopName: string;
      shopDescription: string | null;
      address: string | null;
      shopLogo: string | null;
      shopBannerImage: string | null;
      proofOfIdentity: string | null;
      sampleProducts: string[];
      isAgreedToTermsAndConditions: boolean;
      isHandcraftedOrEthicallySourced: boolean;
    };

    if (seller.sellerProfile) {
      throw new BadRequestException('Seller already has an approved shop');
    }

    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.sellerProfile.create({
        data: {
          userId: seller.id,
          shopName: setupRequest.shopName,
          shopDescription: setupRequest.shopDescription,
          address: setupRequest.address,
          shopLogo: setupRequest.shopLogo,
          shopBannerImage: setupRequest.shopBannerImage,
          proofOfIdentity: setupRequest.proofOfIdentity,
          sampleProducts: setupRequest.sampleProducts,
          isAgreedToTermsAndConditions:
            setupRequest.isAgreedToTermsAndConditions,
          isHandcraftedOrEthicallySourced:
            setupRequest.isHandcraftedOrEthicallySourced,
          isVerified: true,
          isVerifiedByAdmin: true,
          verificationDate: now,
        },
      });

      await tx.shopSetupRequest.update({
        where: { userId: seller.id },
        data: {
          status: 'approved',
          reviewedAt: now,
          reviewedByAdminId: adminId,
          reviewNote: 'Approved by admin',
        },
      });
    });

    this.eventEmitter.emit('shop.approved', {
      sellerId: seller.id,
      shopName: setupRequest.shopName,
    });

    return this.adminShopDetail(seller.id);
  }

  async rejectShopRequest(sellerId: string, adminId: string, reason?: string) {
    const seller = await this.prisma.user.findFirst({
      where: { id: sellerId, role: UserRole.seller },
      select: {
        id: true,
        sellerProfile: true,
        shopSetupRequest: true,
      },
    });

    if (!seller) {
      throw new BadRequestException('Seller not found!');
    }

    if (!seller.shopSetupRequest) {
      throw new BadRequestException('Shop request not found for this seller');
    }

    if (seller.sellerProfile) {
      throw new BadRequestException('Seller already has an approved shop');
    }

    await this.prisma.shopSetupRequest.update({
      where: { userId: seller.id },
      data: {
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedByAdminId: adminId,
        reviewNote: reason?.trim() || 'Rejected by admin',
      },
    });

    return this.adminShopDetail(seller.id);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    console.log(
      '🚀 ~ user.service.ts:26 ~ UserService ~ update ~ updateUserDto:',
      updateUserDto,
    );
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
