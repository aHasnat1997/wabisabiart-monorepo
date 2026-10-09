import { Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';
import { PrismaService } from '@wabisabiart/db';
import { EmailService } from '../../../src/services/email.service.js';
import { RedisService } from '../../../src/services/redis.service.js';
import { TwilioService } from '../../../src/services/twilio.service.js';
import { OTPService } from '../../../src/services/otp.service.js';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    PrismaService,
    EmailService,
    RedisService,
    TwilioService,
    OTPService,
  ],
})
export class UserModule {}
