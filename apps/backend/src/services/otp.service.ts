import { Injectable, BadRequestException } from '@nestjs/common';
import { RedisService } from './redis.service.js';
import { EmailService } from './email.service.js';
import { TwilioService } from './twilio.service.js';

export type OTPProvider = 'email' | 'phone';

export interface SendOTPOptions {
  provider: OTPProvider;
  recipient: string;
  userName?: string;
  purpose?: string;
  ttl?: number;
}

export interface VerifyOTPOptions {
  provider: OTPProvider;
  recipient: string;
  otp: string;
}

@Injectable()
export class OTPService {
  constructor(
    private redisService: RedisService,
    private emailService: EmailService,
    private twilioService: TwilioService,
  ) {}

  generateOTP(length: number = 6): string {
    return Math.floor(
      Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1),
    ).toString();
  }

  async sendOTP(options: SendOTPOptions): Promise<{ message: string }> {
    const {
      provider,
      recipient,
      userName,
      purpose = 'verification',
      ttl = 300,
    } = options;
    const otp = this.generateOTP();

    if (provider === 'email') {
      await this.redisService.setEmailOTP(recipient, otp, ttl);
      await this.emailService.sendEmail({
        to: recipient,
        subject: `${purpose.charAt(0).toUpperCase() + purpose.slice(1)} OTP`,
        templateName: 'otp-verification',
        context: {
          companyName: 'WabiSaviArt',
          clientName: userName || 'User',
          otp,
        },
      });
      return { message: 'OTP sent successfully to your email 📨' };
    } else if (provider === 'phone') {
      await this.redisService.setPhoneOTP(recipient, otp, ttl);
      await this.twilioService.sendSMS(
        recipient,
        `Hello ${userName || 'User'},\nYour ${purpose} code is: ${otp}.\nDon't share it with anyone.\nValid for ${Math.floor(ttl / 60)} minutes.`,
      );
      return { message: 'OTP sent successfully to your phone 📱' };
    } else {
      throw new BadRequestException('Invalid OTP provider');
    }
  }

  async verifyOTP(options: VerifyOTPOptions): Promise<boolean> {
    const { provider, recipient, otp } = options;

    if (provider === 'email') {
      const storedOTP = await this.redisService.getEmailOTP(recipient);
      if (!storedOTP) throw new BadRequestException('OTP expired or not found');
      if (storedOTP !== otp) throw new BadRequestException('Invalid OTP');
      await this.redisService.deleteEmailOTP(recipient);
      return true;
    } else if (provider === 'phone') {
      const storedOTP = await this.redisService.getPhoneOTP(recipient);
      if (!storedOTP) throw new BadRequestException('OTP expired or not found');
      if (storedOTP !== otp) throw new BadRequestException('Invalid OTP');
      await this.redisService.deletePhoneOTP(recipient);
      return true;
    } else {
      throw new BadRequestException('Invalid OTP provider');
    }
  }
}
