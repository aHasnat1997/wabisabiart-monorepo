import {
  CanActivate,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Type,
  UseGuards,
} from '@nestjs/common';
import { JournalService } from './journal.service.js';
import { CreateJournalDto, UpdateJournalDto } from './dto/journal.dto.js';
import { Auth } from '../../decorators/auth.decorator.js';
import { CurrentUser } from '../../decorators/current-user.decorator.js';
import { UserRole } from '@wabisabiart/db';
import {
  ParsedQuery,
  QueryBuilder,
} from '../../../src/decorators/query-builder.decorator.js';
import { ShopJournal } from '@wabisabiart/db';
import { OptionalAuthGuard } from '../auth/optional-auth.guard.js';

@Controller('journal')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Get('admin')
  @Auth(UserRole.admin)
  async adminFindAll(
    @CurrentUser('id') userId: string,
    @Query('view')
    view:
      | 'all'
      | 'published'
      | 'publishing_request'
      | 'blocked'
      | 'rejected' = 'published',
    @QueryBuilder<ShopJournal>({
      searchFields: ['title', 'shortExcerpt'],
      enumFields: ['postStatus'],
      booleanFields: ['published', 'approved'],
      defaultSort: { field: 'createdAt', order: 'desc' },
      include: {
        _count: {
          select: {
            shopJournalComments: true,
            shopJournalLikes: true,
          },
        },
        shopJournalLikes: {
          select: {
            userId: true,
          },
        },
      },
    })
    query: ParsedQuery & { page: number; limit: number },
  ) {
    const { meta, data } = await this.journalService.adminFindAll(
      query,
      view,
      userId,
    );

    return {
      message: 'Admin journals fetched successfully 👍',
      data: {
        items: data,
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
      },
    };
  }

  @Get('admin/:id')
  @Auth(UserRole.admin)
  async adminFindOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return await this.journalService.adminFindOne(id, userId);
  }

  @Patch('admin/:id/status')
  @Auth(UserRole.admin)
  async adminUpdateStatus(
    @Param('id') journalId: string,
    @Body() body: { action: 'publish' | 'reject' | 'block' },
  ) {
    return await this.journalService.adminUpdateStatus(journalId, body.action);
  }

  @Post()
  @Auth(UserRole.seller)
  create(
    @CurrentUser('id') authorId: string,
    @Body() createJournalDto: CreateJournalDto,
  ) {
    return this.journalService.create(authorId, createJournalDto);
  }

  @Get()
  @UseGuards(OptionalAuthGuard as unknown as Type<CanActivate>)
  async findAll(
    @CurrentUser('id') userId: string | undefined,
    @QueryBuilder<ShopJournal>({
      searchFields: ['title', 'shortExcerpt'],
      enumFields: ['postStatus'],
      defaultSort: { field: 'createdAt', order: 'desc' },
      include: {
        _count: {
          select: {
            shopJournalComments: true,
            shopJournalLikes: true,
          },
        },
        shopJournalLikes: {
          select: {
            userId: true,
          },
        },
      },
    })
    query: ParsedQuery & { page: number; limit: number },
  ) {
    const { meta, data } = await this.journalService.findAll(query, userId);
    return {
      message: 'Journals fetched successfully 👍',
      data: {
        items: data,
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
      },
    };
  }

  @Get('my')
  @Auth(UserRole.seller)
  async myJournals(
    @CurrentUser('id') authorId: string,
    @QueryBuilder<ShopJournal>({
      searchFields: ['title', 'shortExcerpt'],
      enumFields: ['postStatus'],
      booleanFields: ['published', 'approved'],
      defaultSort: { field: 'createdAt', order: 'desc' },
      include: {
        _count: {
          select: {
            shopJournalComments: true,
            shopJournalLikes: true,
          },
        },
      },
    })
    query: ParsedQuery & { page: number; limit: number },
  ) {
    const { meta, data } = await this.journalService.myJournals(
      authorId,
      query,
    );
    return {
      message: 'Your journals fetched successfully 👍',
      data: {
        items: data,
        page: meta.page,
        limit: meta.limit,
        total: meta.total,
      },
    };
  }

  @Get('my/status')
  @Auth(UserRole.seller)
  async myJournalsByStatus(@CurrentUser('id') authorId: string) {
    const result = await this.journalService.myJournalStatus(authorId);
    return result;
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string | undefined,
  ) {
    return this.journalService.findOne(id, userId);
  }

  @Patch(':id')
  @Auth(UserRole.seller)
  async update(
    @CurrentUser('id') authorId: string,
    @Param('id') journalId: string,
    @Body() updateJournalDto: UpdateJournalDto,
  ) {
    const result = await this.journalService.update(
      authorId,
      journalId,
      updateJournalDto,
    );

    return result;
  }

  @Delete(':id')
  @Auth(UserRole.seller)
  async remove(
    @CurrentUser('id') authorId: string,
    @Param('id') journalId: string,
  ) {
    return await this.journalService.remove(authorId, journalId);
  }

  @Post('like-unlike/:id')
  @Auth()
  async likeJournal(
    @CurrentUser('id') userId: string,
    @Param('id') journalId: string,
    @Query() query: { action: 'like' | 'unlike' },
  ) {
    if (query.action === 'like') {
      return await this.journalService.likeJournal(journalId, userId);
    }
    if (query.action === 'unlike') {
      return await this.journalService.unlikeJournal(journalId, userId);
    } else {
      return {
        message: 'Invalid action. Use like or unlike.',
      };
    }
  }

  @Post('comment/:id')
  @Auth()
  async addComment(
    @CurrentUser('id') userId: string,
    @Param('id') journalId: string,
    @Body() body: { content: string },
  ) {
    const response = await this.journalService.commentJournal(
      journalId,
      userId,
      body.content,
    );

    return response;
  }

  @Post('reply/:commentId')
  @Auth()
  async replyToComment(
    @CurrentUser('id') userId: string,
    @Param('commentId') commentId: string,
    @Body() body: { content: string },
  ) {
    const response = await this.journalService.replyToComment(
      commentId,
      userId,
      body.content,
    );

    return response;
  }

  @Delete('comment/:commentId')
  @Auth()
  async deleteComment(
    @CurrentUser('id') userId: string,
    @Param('commentId') commentId: string,
  ) {
    const response = await this.journalService.deleteComment(commentId, userId);

    return response;
  }

  @Delete('reply/:replyId')
  @Auth()
  async deleteReply(
    @CurrentUser('id') userId: string,
    @Param('replyId') replyId: string,
  ) {
    const response = await this.journalService.deleteReply(replyId, userId);

    return response;
  }
}
