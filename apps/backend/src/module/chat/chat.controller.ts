import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { Auth } from '../../decorators/auth.decorator.js';
import { CurrentUser } from '../../decorators/current-user.decorator.js';
import { ChatService } from './chat.service.js';
import { CreateConversationDto } from './dto/chat.dto.js';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Auth()
  @Get('conversations')
  findConversations(@CurrentUser() user: any, @Query('type') type?: string) {
    return this.chatService.findConversations(
      user.id,
      user.role,
      user.sellerProfile?.id,
      type,
    );
  }

  @Auth()
  @Post('conversations')
  createConversation(
    @Body() dto: CreateConversationDto,
    @CurrentUser() user: any,
  ) {
    return this.chatService.getOrCreateConversation(
      user.id,
      user.role,
      dto,
      user.sellerProfile?.id,
    );
  }

  @Auth()
  @Get('conversations/:id/messages')
  getMessages(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Query('page') page = '1',
    @Query('limit') limit = '30',
  ) {
    return this.chatService.getMessages(
      id,
      user.id,
      user.role,
      user.sellerProfile?.id,
      +page,
      +limit,
    );
  }

  @Auth()
  @Post('conversations/:id/read')
  markRead(@Param('id') id: string, @CurrentUser() user: any) {
    return this.chatService.markAsRead(
      id,
      user.id,
      user.role,
      user.sellerProfile?.id,
    );
  }

  @Auth()
  @Get('unread-count')
  unreadCount(@CurrentUser() user: any) {
    return this.chatService.getUnreadCount(
      user.id,
      user.role,
      user.sellerProfile?.id,
    );
  }
}
