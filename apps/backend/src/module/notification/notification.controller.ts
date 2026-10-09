import {
  Controller,
  Get,
  Param,
  Patch,
  Req,
  Sse,
  MessageEvent,
  UseInterceptors,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Auth } from '../../decorators/auth.decorator.js';
import { CurrentUser } from '../../decorators/current-user.decorator.js';
import { UserRole } from '@wabisabiart/db';
import { NotificationService } from './notification.service.js';
import { SseService } from '../../services/sse.service.js';
import { NullInterceptor } from '../../interceptors/null.interceptor.js';

@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly sseService: SseService,
  ) {}

  // GET /notification/stream  — SSE connection (all roles)
  @Sse('stream')
  @Auth(UserRole.customer, UserRole.seller, UserRole.admin)
  @UseInterceptors(NullInterceptor)
  stream(
    @CurrentUser('id') userId: string,
    @Req() req: Request,
  ): Observable<MessageEvent> {
    const subject = this.sseService.getOrCreate(userId);
    req.on('close', () => this.sseService.remove(userId));
    return subject.pipe(map((event) => ({ data: JSON.stringify(event) }) as MessageEvent));
  }

  // GET /notification  — list all notifications for current user
  @Get()
  @Auth(UserRole.customer, UserRole.seller, UserRole.admin)
  findAll(@CurrentUser('id') userId: string) {
    return this.notificationService.findAll(userId);
  }

  // GET /notification/unread-count
  @Get('unread-count')
  @Auth(UserRole.customer, UserRole.seller, UserRole.admin)
  unreadCount(@CurrentUser('id') userId: string) {
    return this.notificationService.unreadCount(userId);
  }

  // PATCH /notification/read-all
  @Patch('read-all')
  @Auth(UserRole.customer, UserRole.seller, UserRole.admin)
  markAllRead(@CurrentUser('id') userId: string) {
    return this.notificationService.markAllRead(userId);
  }

  // PATCH /notification/:id/read
  @Patch(':id/read')
  @Auth(UserRole.customer, UserRole.seller, UserRole.admin)
  markRead(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.notificationService.markRead(id, userId);
  }
}
