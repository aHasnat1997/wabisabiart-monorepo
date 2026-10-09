import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@wabisabiart/db';
import {
  CreateSupportContactDto,
  CreateSupportTicketDto,
  EmailSupportDto,
  ReplyEmailDto,
  UpdateSupportTicketDto,
} from './dto/support.dto.js';
import {
  SupportContactDetails,
  Prisma,
} from '@wabisabiart/db';
import { EmailService } from '../../services/email.service.js';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SupportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createTicket(userId: string, dto: CreateSupportTicketDto) {
    const payload = dto;

    const ticket = await this.prisma.supportTicket.create({
      data: {
        userId,
        subject: payload.subject,
        category: payload.category,
        message: payload.message,
        priority: payload.priority,
        attachments: payload.attachments,
      },
    });

    this.eventEmitter.emit('support.ticket_created', {
      subject: ticket.subject,
      ticketId: ticket.id,
    });

    return ticket;
  }

  async sellerTicketList(userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async sellerTicketDetail(userId: string, ticketId: string) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id: ticketId, userId },
    });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    return ticket;
  }

  async emailSupport(payload: EmailSupportDto) {
    const saved = await this.prisma.supportEmail.create({
      data: { ...payload },
    });

    this.eventEmitter.emit('support.email_received', {
      subject: saved.subject,
      emailId: saved.id,
    });

    const contact = await this.prisma.supportContactDetails.findFirst();

    await this.emailService.sendEmail({
      to: payload.email,
      subject: `We received your message: ${payload.subject}`,
      templateName: 'support-email',
      context: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        subject: payload.subject,
        message: payload.message,
        responseTime: contact?.responseTime,
        availableTimeRange: contact?.availableTimeRange,
        availableWeekRange: contact?.availableWeekRange,
      },
    });

    return '📨 Your message has been sent to support. We will get back to you shortly.';
  }

  async adminAllSupportEmail() {
    return await this.prisma.supportEmail.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async adminSupportEmailDetail(emailId: string) {
    const email = await this.prisma.supportEmail.findUnique({
      where: { id: emailId },
    });

    if (!email) {
      throw new NotFoundException('Support email not found');
    }

    await this.prisma.supportEmail.update({
      where: { id: emailId },
      data: {
        isRead: true,
      },
    });

    return email;
  }

  async replyToEmail(emailId: string, dto: ReplyEmailDto) {
    const original = await this.prisma.supportEmail.findUnique({
      where: { id: emailId },
    });

    if (!original) {
      throw new NotFoundException('Support email not found');
    }

    const subject = dto.subject ?? `Re: ${original.subject}`;

    await this.emailService.sendEmail({
      to: original.email,
      subject,
      templateName: 'support-email-reply',
      context: {
        firstName: original.firstName,
        lastName: original.lastName,
        replyMessage: dto.message,
        originalSubject: original.subject,
        originalMessage: original.message,
      },
    });

    return '📨 Reply sent successfully.';
  }

  async adminTicketList() {
    return this.prisma.supportTicket.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            sellerProfile: {
              select: {
                id: true,
                shopName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async adminTicketDetail(ticketId: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            sellerProfile: {
              select: {
                id: true,
                shopName: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    return ticket;
  }

  async adminUpdateTicket(ticketId: string, dto?: UpdateSupportTicketDto) {
    if (!dto || Object.keys(dto || {}).length === 0) {
      return await this.adminTicketDetail(ticketId);
    }

    const payload = dto;

    await this.adminTicketDetail(ticketId);

    const shouldSetResolvedAt =
      payload.status === 'RESOLVED' || payload.status === 'CLOSED';

    return this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        ...(payload.status !== undefined ? { status: payload.status } : {}),
        ...(payload.priority !== undefined
          ? { priority: payload.priority }
          : {}),
        ...(shouldSetResolvedAt
          ? { resolvedAt: new Date() }
          : payload.status === 'OPEN' || payload.status === 'IN_PROGRESS'
            ? { resolvedAt: null }
            : {}),
      },
    });
  }

  async createSupportContactDetails(
    createSupportContactDto: CreateSupportContactDto,
  ) {
    const isContactExists = await this.prisma.supportContactDetails.findFirst();
    let result: SupportContactDetails;
    if (!isContactExists) {
      result = await this.prisma.supportContactDetails.create({
        data: createSupportContactDto,
      });
    } else {
      result = await this.prisma.supportContactDetails.update({
        where: { id: isContactExists.id },
        data: createSupportContactDto,
      });
    }

    return result;
  }

  findSupportContact() {
    return this.prisma.supportContactDetails.findFirst();
  }
}
