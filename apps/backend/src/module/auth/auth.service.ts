import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@wabisabiart/db';
import { LoginDto, ResetPasswordDto } from './dto/auth.dto.js';
import * as bcrypt from 'bcrypt';
import { TTokenPayload } from '../../../src/types/token.type.js';
import { JwtService } from '@nestjs/jwt';
import { OTPProvider, OTPService } from '../../../src/services/otp.service.js';
import { User, UserRole } from '@wabisabiart/db';
import { OAuth2Client } from 'google-auth-library';
import { RedisService } from '../../../src/services/redis.service.js';
import { UAParser } from 'ua-parser-js';
import * as geoip from 'geoip-lite';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly stayLoggedInDurationInSeconds = 30 * 24 * 60 * 60;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private otpService: OTPService,
    private redisService: RedisService,
  ) {}

  private getRememberUntil(stayLoggedIn: boolean): number | undefined {
    if (!stayLoggedIn) {
      return undefined;
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return nowInSeconds + this.stayLoggedInDurationInSeconds;
  }

  private async sendTwoFactorOTP(user: User) {
    const recipient =
      user.otpProvider === 'email' ? user.email : user.phoneNumber;

    if (user.otpProvider === 'phone' && !user.phoneNumber) {
      throw new BadRequestException(
        'Phone number not added. Please add phone number.',
      );
    }

    return await this.otpService.sendOTP({
      provider: user.otpProvider as OTPProvider,
      recipient: recipient!,
      userName: user.fullName,
      purpose: 'login',
    });
  }

  private buildDeviceString(userAgent: string): string {
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser();
    const os = parser.getOS();

    const browserStr = [browser.name, browser.major ?? browser.version]
      .filter(Boolean)
      .join(' ');
    const osStr = [os.name, os.version].filter(Boolean).join(' ');

    if (!browserStr && !osStr) return 'Unknown Device';
    if (!osStr) return browserStr;
    if (!browserStr) return osStr;
    return `${browserStr} on ${osStr}`;
  }

  private getLocation(ip: string): string {
    const cleanIp = ip?.replace(/^::ffff:/, '') ?? '';
    const isPrivate =
      /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$)/.test(cleanIp);
    if (isPrivate) return 'Local Network';
    const geo = geoip.lookup(cleanIp);
    if (!geo) return 'Unknown';
    return [geo.city, geo.country].filter(Boolean).join(', ');
  }

  private async createSession(
    userId: string,
    token: string,
    ip: string,
    userAgent: string,
  ) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await this.prisma.userSession.create({
      data: {
        userId,
        token: tokenHash,
        device: this.buildDeviceString(userAgent),
        ipAddress: ip,
        location: this.getLocation(ip),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  async login(payload: LoginDto, clientIp: string, userAgent: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email, isActive: true },
    });

    if (!user) throw new Error('User not found');

    const isPasswordValid = await bcrypt.compare(
      payload.password,
      user.passwordHash,
    );
    if (!isPasswordValid) throw new Error('Invalid password');

    if (user.twoFactorEnabled) {
      const result = await this.sendTwoFactorOTP(user);
      return {
        isTwoFactorEnabled: true,
        message: `⛔ Two-factor authentication enabled. ${result.message}`,
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

    const tokenPayload: TTokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      stayLoggedIn: payload.stayLoggedIn,
      rememberUntil: this.getRememberUntil(payload.stayLoggedIn),
    };

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });

    await this.createSession(user.id, accessToken, clientIp, userAgent);

    return {
      isTwoFactorEnabled: false,
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

  private async verifyGoogleToken(token: string) {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    return await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  }

  async googleAuth(googleToken: string, role: UserRole) {
    // Verify Google token
    const ticket = await this.verifyGoogleToken(googleToken);
    const payload = ticket.getPayload();

    let user = await this.prisma.user.findUnique({
      where: { email: payload?.email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: payload?.email as string,
          fullName: payload?.name as string,
          avatarUrl: payload?.picture,
          emailVerified: true,
          role: role,
          passwordHash: await bcrypt.hash(Math.random().toString(36), 10),
        },
      });
    }

    const accessToken = this.jwtService.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        stayLoggedIn: false,
      },
      { secret: process.env.JWT_SECRET, expiresIn: '7d' },
    );

    return { user, accessToken };
  }

  async verifyTwoFactorAuth(
    email: string,
    otpProvider: 'email' | 'phone',
    otp: string,
    stayLoggedIn = false,
  ) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('User not found!');

    const recipient = otpProvider === 'email' ? user.email : user.phoneNumber;
    if (otpProvider === 'phone' && !user.phoneNumber) {
      throw new BadRequestException(
        'Phone number not added. Please add phone number.',
      );
    }

    await this.otpService.verifyOTP({
      provider: otpProvider,
      recipient: recipient!,
      otp,
    });

    const tokenPayload: TTokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      stayLoggedIn,
      rememberUntil: this.getRememberUntil(stayLoggedIn),
    };

    return {
      message: 'OTP verification successfully 👍',
      accessToken: this.jwtService.sign(tokenPayload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '7d',
      }),
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
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

  async sendForgetPasswordOtp(value: string, otpProvider: 'email' | 'phone') {
    let user: User | null;

    if (otpProvider === 'email') {
      user = await this.prisma.user.findUnique({ where: { email: value } });
    } else {
      user = await this.prisma.user.findUnique({
        where: { phoneNumber: value },
      });
    }
    if (!user) throw new BadRequestException('User not found!');

    const recipient =
      user.otpProvider === 'email' ? user.email : user.phoneNumber;

    return await this.otpService.sendOTP({
      provider: user.otpProvider as OTPProvider,
      recipient: recipient!,
      userName: user.fullName,
      purpose: 'forget-password',
    });
  }

  async verifyForgetPasswordOtp(
    value: string,
    otpProvider: 'email' | 'phone',
    otp: string,
  ) {
    let user: User;

    if (otpProvider === 'email') {
      const isUserExists = await this.prisma.user.findUnique({
        where: { email: value },
      });
      if (!isUserExists) throw new BadRequestException('User not found!');
      user = isUserExists;
    } else {
      const isUserExists = await this.prisma.user.findUnique({
        where: { phoneNumber: value },
      });
      if (!isUserExists) throw new BadRequestException('User not found!');
      user = isUserExists;
    }

    const recipient = otpProvider === 'email' ? user.email : user.phoneNumber;
    if (otpProvider === 'phone' && !user.phoneNumber) {
      throw new BadRequestException(
        'Phone number not added. Please add phone number.',
      );
    }

    const isVerified = await this.otpService.verifyOTP({
      provider: otpProvider,
      recipient: recipient!,
      otp,
    });

    if (!isVerified) throw new BadRequestException('Invalid OTP!');

    const tokenPayload: TTokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      stayLoggedIn: false,
    };

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '5m',
    });

    return {
      message: 'OTP verification successfully 👍',
      accessToken,
    };
  }

  async resetPassword(payload: ResetPasswordDto) {
    const isTokenBlacklisted = await this.redisService.isTokenBlacklisted(
      payload.accessToken,
    );

    if (isTokenBlacklisted) throw new BadRequestException('Invalid token!');

    const isTokenValid = await this.jwtService.verifyAsync<TTokenPayload>(
      payload.accessToken,
      {
        secret: process.env.JWT_SECRET,
      },
    );

    if (!isTokenValid) throw new BadRequestException('Invalid token!');

    const user = await this.prisma.user.findUnique({
      where: { id: isTokenValid.id },
    });
    if (!user) throw new BadRequestException('User not found!');

    const isPasswordValid = await bcrypt.compare(
      payload.password,
      user.passwordHash,
    );
    if (isPasswordValid)
      throw new BadRequestException("Don't use old password!");

    const hashedPassword = await bcrypt.hash(payload.password, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });

    await this.redisService.blacklistToken(payload.accessToken);

    return { message: 'Password reset successfully 👍' };
  }

  async getSessions(userId: string) {
    return this.prisma.userSession.findMany({
      where: { userId, isActive: true, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeSession(sessionId: string, userId: string) {
    return this.prisma.userSession.updateMany({
      where: { id: sessionId, userId },
      data: { isActive: false },
    });
  }

  async revokeAllSessions(userId: string, currentTokenHash: string) {
    return this.prisma.userSession.updateMany({
      where: {
        userId,
        token: { not: currentTokenHash },
      },
      data: { isActive: false },
    });
  }
}
