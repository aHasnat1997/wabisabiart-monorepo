import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@wabisabiart/db';
import { CreateConversationDto, SendMessageDto } from './dto/chat.dto.js';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async assertCanJoin(
    conversationId: string,
    userId: string,
    role: string,
    sellerProfileId?: string,
  ) {
    const convo = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!convo) throw new NotFoundException('Conversation not found');
    this.assertParticipant(convo, userId, role, sellerProfileId);
    return convo;
  }

  async getOrCreateConversation(
    userId: string,
    role: string,
    dto: CreateConversationDto | SendMessageDto,
    sellerProfileId?: string,
  ) {
    if (dto.conversationId) {
      const convo = await this.prisma.conversation.findUnique({
        where: { id: dto.conversationId },
      });
      if (!convo) throw new NotFoundException('Conversation not found');
      this.assertParticipant(convo, userId, role, sellerProfileId);
      return convo;
    }

    if (dto.type === 'support') {
      const existing = await this.prisma.conversation.findFirst({
        where: {
          customerId: userId,
          type: 'support',
          sellerId: null,
          orderId: dto.orderId ?? null,
        },
      });
      if (existing) return existing;
      return this.prisma.conversation.create({
        data: {
          customerId: userId,
          sellerId: null,
          type: 'support',
          orderId: dto.orderId,
        },
      });
    }

    // general, order_inquiry, refund_request, product_inquiry: customer <-> seller
    if (!dto.receiverId)
      throw new ForbiddenException('receiverId (sellerProfileId) required');

    const targetCustomerId = role === 'seller' ? dto.receiverId! : userId;
    const targetSellerId =
      role === 'seller' ? sellerProfileId! : dto.receiverId;

    const existing = await this.prisma.conversation.findFirst({
      where: {
        customerId: targetCustomerId,
        sellerId: targetSellerId,
        orderId: dto.orderId ?? null,
        type: dto.type,
      },
    });
    if (existing) return existing;

    return this.prisma.conversation.create({
      data: {
        customerId: targetCustomerId,
        sellerId: targetSellerId,
        orderId: dto.orderId,
        // productId: dto.productId, // if you added the field
        type: dto.type,
      },
    });
  }

  private assertParticipant(
    convo: any,
    userId: string,
    role: string,
    sellerProfileId?: string,
  ) {
    if (role === 'admin') {
      if (convo.type !== 'support') throw new ForbiddenException();
      return;
    }
    if (convo.type === 'support') {
      if (convo.customerId !== userId) throw new ForbiddenException();
      return;
    }
    const isCustomer = convo.customerId === userId;
    const isSeller = sellerProfileId && convo.sellerId === sellerProfileId;
    if (!isCustomer && !isSeller) throw new ForbiddenException();
  }

  async sendMessage(
    userId: string,
    role: string,
    sellerProfileId: string | undefined,
    dto: SendMessageDto,
  ) {
    const convo = await this.getOrCreateConversation(
      userId,
      role,
      dto,
      sellerProfileId,
    );

    const message = await this.prisma.chatMessage.create({
      data: {
        conversationId: convo.id,
        senderId: userId,
        content: dto.content,
        attachments: dto.attachments,
      },
      include: {
        sender: {
          select: { id: true, fullName: true, avatarUrl: true, role: true },
        },
      },
    });

    await this.prisma.conversation.update({
      where: { id: convo.id },
      data: { lastMessage: dto.content, lastMessageAt: new Date() },
    });

    return { conversation: convo, message };
  }

  async findConversations(
    userId: string,
    role: string,
    sellerProfileId?: string,
    type?: string,
  ) {
    let where: any = {};
    if (role === 'admin') {
      where = { type: 'support' };
    } else if (role === 'seller' && sellerProfileId) {
      where = {
        OR: [
          { sellerId: sellerProfileId },
          { customerId: userId, type: 'support' },
        ],
      };
    } else {
      where = {
        customerId: userId,
      };
    }
    if (type) where.type = type;

    return this.prisma.conversation.findMany({
      where,
      orderBy: { lastMessageAt: 'desc' },
      include: {
        customer: { select: { id: true, fullName: true, avatarUrl: true } },
        seller: { select: { id: true, shopName: true, shopLogo: true } },
      },
    });
  }

  async getMessages(
    conversationId: string,
    userId: string,
    role: string,
    sellerProfileId?: string,
    page = 1,
    limit = 30,
  ) {
    const convo = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!convo) throw new NotFoundException();
    this.assertParticipant(convo, userId, role, sellerProfileId);

    const messages = await this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        sender: {
          select: { id: true, fullName: true, avatarUrl: true, role: true },
        },
      },
    });

    return messages.reverse();
  }

  async markAsRead(
    conversationId: string,
    userId: string,
    role: string,
    sellerProfileId?: string,
  ) {
    const convo = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!convo) throw new NotFoundException();
    this.assertParticipant(convo, userId, role, sellerProfileId);

    return this.prisma.chatMessage.updateMany({
      where: { conversationId, senderId: { not: userId }, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async getUnreadCount(userId: string, role: string, sellerProfileId?: string) {
    const conversations = await this.findConversations(
      userId,
      role,
      sellerProfileId,
    );
    const convoIds = conversations.map((c) => c.id);

    return this.prisma.chatMessage.count({
      where: {
        conversationId: { in: convoIds },
        senderId: { not: userId },
        isRead: false,
      },
    });
  }
}
