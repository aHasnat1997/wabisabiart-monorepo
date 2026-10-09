import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async setEmailOTP(
    email: string,
    otp: string,
    ttl: number = 300,
  ): Promise<void> {
    await this.cacheManager.set(`otp:${email}`, otp, ttl * 1000);
  }

  async getEmailOTP(email: string): Promise<string | undefined> {
    return await this.cacheManager.get(`otp:${email}`);
  }

  async deleteEmailOTP(email: string): Promise<void> {
    await this.cacheManager.del(`otp:${email}`);
  }

  async setPhoneOTP(
    phone: string,
    otp: string,
    ttl: number = 300,
  ): Promise<void> {
    await this.cacheManager.set(`otp:phone:${phone}`, otp, ttl * 1000);
  }

  async getPhoneOTP(phone: string): Promise<string | undefined> {
    return await this.cacheManager.get(`otp:phone:${phone}`);
  }

  async deletePhoneOTP(phone: string): Promise<void> {
    await this.cacheManager.del(`otp:phone:${phone}`);
  }

  async blacklistToken(token: string, ttl: number = 86400): Promise<void> {
    await this.cacheManager.set(`token-blacklist:${token}`, '1', ttl * 1000);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.cacheManager.get(`token-blacklist:${token}`);
    return result !== null && result !== undefined;
  }
}
