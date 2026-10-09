import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service.js';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto.js';
import type { Request, Response } from 'express';
import { ShopSetupDto } from './dto/shop-setup.dto.js';
import { FeatureShopDto } from './dto/feature-shop.dto.js';
import {
  UpdateSellerProfileDto,
  UpdateUserProfileDto,
} from './dto/user-profile.dto.js';
import { Auth } from '../../../src/decorators/auth.decorator.js';
import { CurrentUser } from '../../../src/decorators/current-user.decorator.js';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  private getAccessTokenCookieName(): string {
    return process.env.ACCESS_TOKEN_COOKIE_NAME || 'access-token';
  }

  private setAccessTokenCookie(response: Response, accessToken: string) {
    response.cookie(this.getAccessTokenCookieName(), accessToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Post('send-email-otp')
  async sendEmailOTP(@Body() body: { email: string }) {
    return this.userService.sendEmailOTP(body.email);
  }

  @Post('verify-email-otp')
  async verifyEmailOTP(
    @Body() body: { email: string; otp: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.userService.verifyEmailOTP(body.email, body.otp);

    this.setAccessTokenCookie(res, result.accessToken);

    return {
      statusCode: HttpStatus.OK,
      message: 'Email verified successfully 👍',
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    };
  }

  @Post('send-phone-otp')
  async sendPhoneOTP(@Body() body: { phoneNumber: string; email: string }) {
    return this.userService.sendPhoneOTP(body.phoneNumber, body.email);
  }

  @Post('verify-phone-otp')
  async verifyPhoneOTP(
    @Body() body: { phoneNumber: string; otp: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.userService.verifyPhoneOTP(
      body.phoneNumber,
      body.otp,
    );

    this.setAccessTokenCookie(res, result.accessToken);

    return {
      statusCode: HttpStatus.OK,
      message: 'Phone verified successfully 👍',
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    };
  }

  @Post('two-factor-otp')
  async sendTwoFactorOTP(
    @Body() body: { provider: 'email' | 'phone'; userId: string },
  ) {
    const result = await this.userService.sendTwoFactorOTP({
      userId: body.userId,
      otpProvider: body.provider,
    });

    return {
      message: result.message,
      data: { provider: body.provider },
    };
  }

  @Post('toggle-two-factor-verification')
  async toggleTwoFactorVerification(
    @Body()
    body: {
      userId: string;
      otp: string;
      provider: 'email' | 'phone';
      twoFActorEnable: boolean;
    },
  ) {
    if (!body.twoFActorEnable) {
      return await this.userService.disableTwoFactorAuth({
        userId: body.userId,
        otp: body.otp,
      });
    }

    return await this.userService.enableTwoFactorAuth({
      userId: body.userId,
      otpProvider: body.provider,
      otp: body.otp,
    });
  }

  @Get()
  @Auth('admin')
  findAll() {
    return this.userService.findAll();
  }

  @Get('profile')
  @Auth()
  async profile(@Req() req: Request) {
    const userId = req?.user?.id as string;
    return await this.userService.me(userId);
  }

  @Patch('profile')
  @Auth()
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() body: UpdateUserProfileDto,
  ) {
    const result = await this.userService.updateProfile(userId, body);
    return {
      message: 'Profile updated successfully 👍',
      data: result,
    };
  }

  @Patch('seller-profile')
  @Auth('seller')
  async updateSellerProfile(
    @CurrentUser('id') userId: string,
    @Body() body: UpdateSellerProfileDto,
  ) {
    const result = await this.userService.updateSellerProfile(userId, body);
    return {
      message: 'Seller profile updated successfully 👍',
      data: result,
    };
  }

  @Get('shops/featured')
  async featuredShopList() {
    const result = await this.userService.featuredShopList();
    return {
      message: 'Featured shops fetched successfully 👍',
      data: result,
    };
  }

  @Get('shops/:shopId/public')
  async getPublicShopDetails(@Param('shopId') shopId: string) {
    const result = await this.userService.getPublicShopDetails(shopId);
    return {
      message: 'Shop details fetched successfully 👍',
      data: result,
    };
  }

  @Get('admin/shops')
  @Auth('admin')
  async adminShopList() {
    const result = await this.userService.adminShopList();
    return {
      message: 'Shops fetched successfully 👍',
      data: result,
    };
  }

  @Get('admin/shops/:sellerId')
  @Auth('admin')
  async adminShopDetail(@Param('sellerId') sellerId: string) {
    const result = await this.userService.adminShopDetail(sellerId);
    return {
      message: 'Shop details fetched successfully 👍',
      data: result,
    };
  }

  @Patch('admin/shops/:sellerId/featured')
  @Auth('admin')
  async setFeaturedShop(
    @Param('sellerId') sellerId: string,
    @Body() body: FeatureShopDto,
  ) {
    const result = await this.userService.setFeaturedShop(
      sellerId,
      body.isFeatured,
    );

    return {
      message: body.isFeatured
        ? 'Shop marked as featured successfully 👍'
        : 'Shop removed from featured successfully 👍',
      data: result,
    };
  }

  @Patch('admin/shops/:sellerId/approve')
  @Auth('admin')
  async approveShopRequest(
    @Param('sellerId') sellerId: string,
    @CurrentUser('id') adminId: string,
  ) {
    const result = await this.userService.approveShopRequest(sellerId, adminId);
    return {
      message: 'Shop approved successfully 👍',
      data: result,
    };
  }

  @Patch('admin/shops/:sellerId/reject')
  @Auth('admin')
  async rejectShopRequest(
    @Param('sellerId') sellerId: string,
    @CurrentUser('id') adminId: string,
    @Body() body: { reason?: string },
  ) {
    const result = await this.userService.rejectShopRequest(
      sellerId,
      adminId,
      body.reason,
    );
    return {
      message: 'Shop request rejected successfully 👍',
      data: result,
    };
  }

  // @Get(':id')
  // @Auth()
  // async me(@Req() req: Request) {
  //   const userId = req?.user?.id as string;
  //   return await this.userService.me(userId);
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Post('setup-shop')
  @Auth('seller')
  async setupShop(
    @Body() body: ShopSetupDto,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.userService.setupShop(userId, body);
    return {
      message: 'Shop request submitted successfully 👍',
      data: result,
    };
  }
}
