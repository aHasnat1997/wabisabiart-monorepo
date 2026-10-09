// src/services/twilio.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private client: twilio.Twilio;

  constructor(private configService: ConfigService) {
    this.client = twilio(
      this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      this.configService.get<string>('TWILIO_AUTH_TOKEN'),
    );
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      await this.client.messages.create({
        body: message,
        from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
        to,
      });
      this.logger.log(`📱 SMS sent successfully.`);
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to send SMS', error);
      return false;
    }
  }
}
