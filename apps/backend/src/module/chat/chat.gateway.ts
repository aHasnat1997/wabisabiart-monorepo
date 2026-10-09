import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service.js';
import {
  SendMessageDto,
  MarkReadDto,
  JoinConversationDto,
  CreateConversationDto,
} from './dto/chat.dto.js';
import { Auth } from '../../decorators/auth.decorator.js';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') ?? '*',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(_client: Socket) {}
  handleDisconnect(_client: Socket) {}

  @Auth()
  @SubscribeMessage('createConversation')
  async createConversation(
    @MessageBody() dto: CreateConversationDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    const convo = await this.chatService.getOrCreateConversation(
      user.id,
      user.role,
      dto, // CreateConversationDto is structurally compatible
      user.sellerProfile?.id,
    );
    client.join(`conversation:${convo.id}`);
    return { event: 'conversationCreated', conversation: convo };
  }

  @Auth()
  @SubscribeMessage('joinConversation')
  async joinConversation(
    @MessageBody() dto: JoinConversationDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    await this.chatService.assertCanJoin(
      dto.conversationId,
      user.id,
      user.role,
      user.sellerProfile?.id,
    );
    client.join(`conversation:${dto.conversationId}`);
    return { event: 'joinedConversation', conversationId: dto.conversationId };
  }

  @Auth()
  @SubscribeMessage('leaveConversation')
  leaveConversation(
    @MessageBody() dto: JoinConversationDto,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`conversation:${dto.conversationId}`);
  }

  @Auth()
  @UsePipes(new ZodValidationPipe())
  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody() dto: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    const result = await this.chatService.sendMessage(
      user.id,
      user.role,
      user.sellerProfile?.id,
      dto,
    );

    const room = `conversation:${result.conversation.id}`;
    client.join(room);
    this.server.to(room).emit('newMessage', result.message);

    return result;
  }

  @Auth()
  @SubscribeMessage('markAsRead')
  async markAsRead(
    @MessageBody() dto: MarkReadDto,
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    await this.chatService.markAsRead(
      dto.conversationId,
      user.id,
      user.role,
      user.sellerProfile?.id,
    );
    this.server.to(`conversation:${dto.conversationId}`).emit('messagesRead', {
      conversationId: dto.conversationId,
      readBy: user.id,
    });
  }

  @Auth()
  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() dto: { conversationId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    client
      .to(`conversation:${dto.conversationId}`)
      .emit('userTyping', { userId: user.id, isTyping: dto.isTyping });
  }
}
