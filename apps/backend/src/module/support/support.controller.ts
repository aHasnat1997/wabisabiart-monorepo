import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Auth } from '../../../src/decorators/auth.decorator.js';
import { CurrentUser } from '../../../src/decorators/current-user.decorator.js';
import { SupportService } from './support.service.js';
import {
  CreateSupportContactDto,
  CreateSupportTicketDto,
  EmailSupportDto,
  ReplyEmailDto,
  UpdateSupportTicketDto,
} from './dto/support.dto.js';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get('seller/tickets')
  @Auth('seller')
  async sellerTickets(@CurrentUser('id') userId: string) {
    const result = await this.supportService.sellerTicketList(userId);

    return {
      message: 'Support tickets fetched successfully 👍',
      data: result,
    };
  }

  @Post('seller/tickets')
  @Auth('seller')
  async createSellerTicket(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSupportTicketDto,
  ) {
    const result = await this.supportService.createTicket(userId, dto);

    return {
      message: 'Support ticket created successfully 👍',
      data: result,
    };
  }

  @Get('seller/tickets/:id')
  @Auth('seller')
  async sellerTicketDetail(
    @CurrentUser('id') userId: string,
    @Param('id') ticketId: string,
  ) {
    const result = await this.supportService.sellerTicketDetail(
      userId,
      ticketId,
    );

    return {
      message: 'Support ticket fetched successfully 👍',
      data: result,
    };
  }

  @Post('/email')
  async emailSupport(@Body() dto: EmailSupportDto) {
    const result = await this.supportService.emailSupport(dto);

    return {
      message: 'Support email sent successfully 👍',
      data: result,
    };
  }

  @Get('admin/emails')
  @Auth('admin')
  async adminAllSupportEmail() {
    const result = await this.supportService.adminAllSupportEmail();

    return {
      message: 'Support emails fetched successfully 👍',
      data: result,
    };
  }

  @Get('admin/emails/:id')
  @Auth('admin')
  async adminSupportEmailDetail(@Param('id') emailId: string) {
    const result = await this.supportService.adminSupportEmailDetail(emailId);

    return {
      message: 'Support email detail fetched successfully 👍',
      data: result,
    };
  }

  @Post('admin/emails/:id/reply')
  @Auth('admin')
  async adminReplyEmail(
    @Param('id') emailId: string,
    @Body() dto: ReplyEmailDto,
  ) {
    const result = await this.supportService.replyToEmail(emailId, dto);
    return {
      message: 'Reply sent successfully 👍',
      data: result,
    };
  }

  @Get('admin/tickets')
  @Auth('admin')
  async adminTickets() {
    const result = await this.supportService.adminTicketList();

    return {
      message: 'Support tickets fetched successfully 👍',
      data: result,
    };
  }

  @Get('admin/tickets/:id')
  @Auth('admin')
  async adminTicketDetail(@Param('id') ticketId: string) {
    const result = await this.supportService.adminTicketDetail(ticketId);

    return {
      message: 'Support ticket fetched successfully 👍',
      data: result,
    };
  }

  @Patch('admin/tickets/:id')
  @Auth('admin')
  async adminUpdateTicket(
    @Param('id') ticketId: string,
    @Body() dto: UpdateSupportTicketDto = {},
  ) {
    const result = await this.supportService.adminUpdateTicket(
      ticketId,
      dto || {},
    );

    return {
      message: 'Support ticket updated successfully 👍',
      data: result,
    };
  }

  @Get('/contacts')
  findAdminContact() {
    return this.supportService.findSupportContact();
  }

  @Post('/contacts')
  @Auth('admin')
  async create(@Body() createAdminContactDto: CreateSupportContactDto) {
    const result = await this.supportService.createSupportContactDetails(
      createAdminContactDto,
    );

    return {
      message: 'Support contact created successfully 👍',
      data: result,
    };
  }
}
