import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StripeService } from './stripe.service.js';
import { StripeController } from './stripe.controller.js';
import { StripeWebhookController } from './stripe.webhook.controller.js';
import { PrismaService } from '@wabisabiart/db';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [StripeController, StripeWebhookController],
  providers: [StripeService, PrismaService],
  exports: [StripeService],
})
export class StripeModule {}
