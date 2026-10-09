import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { Auth } from '../../../src/decorators/auth.decorator.js';
import { CurrentUser } from '../../../src/decorators/current-user.decorator.js';
import { SellerSettingsService } from './seller-settings.service.js';
import {
  ChangeSellerPasswordDto,
  SubmitAuthenticityDto,
  UpdatePlatformFeeDto,
  UpdateSellerProfileDto,
  UpdateSellerStoreDto,
} from './dto/seller-settings.dto.js';

@Controller('seller-settings')
export class SellerSettingsController {
  constructor(private readonly sellerSettingsService: SellerSettingsService) {}

  @Get('overview')
  @Auth('seller')
  async sellerOverview(@CurrentUser('id') userId: string) {
    const result =
      await this.sellerSettingsService.getSellerSettingsOverview(userId);

    return {
      message: 'Seller settings overview fetched successfully 👍',
      data: result,
    };
  }

  @Patch('profile')
  @Auth('seller')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateSellerProfileDto,
  ) {
    const result = await this.sellerSettingsService.updateSellerProfile(
      userId,
      dto,
    );

    return {
      message: 'Profile updated successfully 👍',
      data: result,
    };
  }

  @Patch('store')
  @Auth('seller')
  async updateStore(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateSellerStoreDto,
  ) {
    const result = await this.sellerSettingsService.updateSellerStore(
      userId,
      dto,
    );

    return {
      message: 'Store settings updated successfully 👍',
      data: result,
    };
  }

  @Get('authenticity')
  @Auth('seller')
  async authenticity(@CurrentUser('id') userId: string) {
    const result =
      await this.sellerSettingsService.getAuthenticityStatus(userId);

    return {
      message: 'Authenticity status fetched successfully 👍',
      data: result,
    };
  }

  @Post('authenticity/submit')
  @Auth('seller')
  async submitAuthenticity(
    @CurrentUser('id') userId: string,
    @Body() dto: SubmitAuthenticityDto,
  ) {
    const result = await this.sellerSettingsService.submitAuthenticity(
      userId,
      dto,
    );

    return {
      message: 'Authenticity proof submitted successfully 👍',
      data: result,
    };
  }

  @Get('security')
  @Auth('seller')
  async security(@CurrentUser('id') userId: string) {
    const result = await this.sellerSettingsService.getSecuritySettings(userId);

    return {
      message: 'Security settings fetched successfully 👍',
      data: result,
    };
  }

  @Patch('security/password')
  @Auth('seller')
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangeSellerPasswordDto,
  ) {
    const result = await this.sellerSettingsService.changeSellerPassword(
      userId,
      dto,
    );

    return {
      message: 'Password updated successfully 👍',
      data: result,
    };
  }

  @Get('billing-fees')
  @Auth('seller')
  async sellerBillingAndFees() {
    const result = await this.sellerSettingsService.getSellerBillingAndFees();

    return {
      message: 'Billing & fees fetched successfully 👍',
      data: result,
    };
  }

  @Get('admin/billing-fees')
  @Auth('admin')
  async adminBillingAndFees() {
    const result = await this.sellerSettingsService.getAdminBillingAndFees();

    return {
      message: 'Billing & fees fetched successfully 👍',
      data: result,
    };
  }

  @Patch('admin/billing-fees')
  @Auth('admin')
  async updateAdminBillingAndFees(@Body() dto: UpdatePlatformFeeDto) {
    const result =
      await this.sellerSettingsService.updateAdminBillingAndFees(dto);

    return {
      message: 'Billing & fees updated successfully 👍',
      data: result,
    };
  }
}
