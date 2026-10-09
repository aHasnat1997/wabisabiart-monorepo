import { Module } from '@nestjs/common';
import { AppService } from './app.service.js';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { MediaModule } from './media/media.module.js';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { AuthModule } from './module/auth/auth.module.js';
import { UserModule } from './module/user/user.module.js';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './interceptors/response.interceptor.js';
import { ProductModule } from './module/product/product.module.js';
import { CategoryModule } from './module/category/category.module.js';
import { OrderModule } from './module/order/order.module.js';
import { CartModule } from './module/cart/cart.module.js';
import { AddressModule } from './module/address/address.module.js';
import { JournalModule } from './module/journal/journal.module.js';
import { MarketingModule } from './module/marketing/marketing.module.js';
import { InsightsModule } from './module/insights/insights.module.js';
import { CustomersModule } from './module/customers/customers.module.js';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SellerSettingsModule } from './module/seller-settings/seller-settings.module.js';
import { SupportModule } from './module/support/support.module.js';
import { WishlistModule } from './module/wishlist/wishlist.module.js';
import { SellerDashboardModule } from './module/seller-dashboard/seller-dashboard.module.js';
import { StripeModule } from './module/stripe/stripe.module.js';
import { ReviewModule } from './module/review/review.module.js';
import { AppController } from './app.controller.js';
import { ChatModule } from './module/chat/chat.module.js';
import { LegalsModule } from './module/legals/legals.module.js';
import { ReportModule } from './module/report/report.module.js';
import { BackupModule } from './module/backup/backup.module.js';
import { NotificationModule } from './module/notification/notification.module.js';
import { CmsModule } from './module/cms/cms.module.js';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 30000,
          limit: 10,
        },
      ],
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT!),
      password: process.env.REDIS_PASSWORD,
      ttl: 300,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    MediaModule,
    AuthModule,
    UserModule,
    ProductModule,
    CategoryModule,
    OrderModule,
    CartModule,
    AddressModule,
    JournalModule,
    MarketingModule,
    InsightsModule,
    CustomersModule,
    SellerSettingsModule,
    SupportModule,
    WishlistModule,
    SellerDashboardModule,
    StripeModule,
    ReviewModule,
    ChatModule,
    LegalsModule,
    ReportModule,
    BackupModule,
    NotificationModule,
    CmsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_GUARD, // 👈 add this
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
