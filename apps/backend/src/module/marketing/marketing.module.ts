import { Module } from '@nestjs/common';
import { DiscountEngineService } from './discount-engine/discount-engine.service.js';
import { PromotionsService } from './promotions/promotions.service.js';
import { PromotionsController } from './promotions/promotions.controller.js';
import { PrismaService } from '@wabisabiart/db';
import { CouponsService } from './coupons/coupons.service.js';
import { CouponsController } from './coupons/coupons.controller.js';
import { FreeShippingService } from './free-shipping/free-shipping.service.js';
import { FreeShippingController } from './free-shipping/free-shipping.controller.js';
import { WishlistCouponsService } from './wishlist-coupons/wishlist-coupons.service.js';
import { WishlistCouponsController } from './wishlist-coupons/wishlist-coupons.controller.js';
import { SellerOwnsPromotionGuard } from './guards/seller-owns-promotion.guard.js';
import { SellerOwnsCouponGuard } from './guards/seller-owns-coupon.guard.js';
import { SellerOwnsFreeShippingRuleGuard } from './guards/seller-owns-free-shipping-rule.guard.js';

@Module({
  controllers: [
    PromotionsController,
    CouponsController,
    FreeShippingController,
    WishlistCouponsController,
  ],
  providers: [
    PrismaService,
    PromotionsService,
    DiscountEngineService,
    CouponsService,
    FreeShippingService,
    WishlistCouponsService,
    SellerOwnsPromotionGuard,
    SellerOwnsCouponGuard,
    SellerOwnsFreeShippingRuleGuard,
  ],
  exports: [
    DiscountEngineService,
    CouponsService,
    FreeShippingService,
    WishlistCouponsService,
  ],
})
export class MarketingModule {}
