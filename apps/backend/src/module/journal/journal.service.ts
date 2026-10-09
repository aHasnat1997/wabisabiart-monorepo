import { BadGatewayException, Injectable } from '@nestjs/common';
import { CreateJournalDto, UpdateJournalDto } from './dto/journal.dto.js';
import { PrismaService } from '@wabisabiart/db';
import {
  executeQuery,
  ParsedQuery,
} from '../../../src/decorators/query-builder.decorator.js';
import { EventEmitter2 } from '@nestjs/event-emitter';

type JournalListItem = {
  shopJournalLikes?: Array<{ userId: string }>;
} & Record<string, unknown>;

@Injectable()
export class JournalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async isAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user.role === 'admin';
  }

  async create(authorId: string, createJournalDto: CreateJournalDto) {
    const author = await this.prisma.user.findUnique({
      where: { id: authorId },
      include: { sellerProfile: true },
    });

    if (
      !author ||
      !author.sellerProfile ||
      !author.sellerProfile.isVerifiedByAdmin
    ) {
      throw new Error('Only verified sellers can create journal entries');
    }

    const journal = await this.prisma.shopJournal.create({
      data: {
        shopId: author.sellerProfile.id,
        ...createJournalDto,
      },
    });

    this.eventEmitter.emit('journal.pending_review', {
      journalTitle: journal.title,
      journalId: journal.id,
    });

    return journal;
  }

  async findAll(
    query: ParsedQuery & { page: number; limit: number },
    currentUserId?: string,
  ) {
    const allActiveJournals = {
      ...query,
      where: {
        ...query.where,
        postStatus: 'published',
        published: true,
        approved: true,
      },
    };

    const response = await executeQuery<JournalListItem>(
      this.prisma.shopJournal,
      allActiveJournals,
    );

    const dataWithLikeFlag = response.data.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ content, shopJournalLikes, ...journal }) => ({
        ...journal,
        isLikedByCurrentUser: currentUserId
          ? (shopJournalLikes ?? []).some(
              (like) => like.userId === currentUserId,
            )
          : false,
      }),
    );

    return {
      ...response,
      data: dataWithLikeFlag,
    };
  }

  async myJournals(
    authorId: string,
    query: ParsedQuery & { page: number; limit: number },
  ) {
    const author = await this.prisma.user.findUnique({
      where: { id: authorId },
      include: { sellerProfile: true },
    });

    if (!author || !author.sellerProfile) {
      throw new Error('Author not found');
    }

    const myJournalsQuery = {
      ...query,
      where: { ...query.where, shopId: author.sellerProfile.id },
    };

    const response = await executeQuery(
      this.prisma.shopJournal,
      myJournalsQuery,
    );

    return response;
  }

  async myJournalStatus(authorId: string) {
    const author = await this.prisma.user.findUnique({
      where: { id: authorId },
      include: { sellerProfile: true },
    });

    if (!author || !author.sellerProfile) {
      throw new Error('Author not found');
    }

    const shopId = author.sellerProfile.id;

    const [totalPublishedPosts, totalLikes, totalComments] = await Promise.all([
      this.prisma.shopJournal.count({
        where: {
          shopId,
          postStatus: 'published',
        },
      }),
      this.prisma.shopJournalLikes.count({
        where: {
          journal: {
            shopId,
          },
        },
      }),
      this.prisma.shopJournalComment.count({
        where: {
          journal: {
            shopId,
          },
        },
      }),
    ]);

    return {
      totalPublishedPosts,
      totalViews: 0,
      totalLikes,
      totalComments,
    };
  }

  async adminFindAll(
    query: ParsedQuery & { page: number; limit: number },
    view?: 'all' | 'published' | 'publishing_request' | 'blocked' | 'rejected',
    currentUserId?: string,
  ) {
    const whereWithoutView = { ...(query.where || {}) } as Record<
      string,
      unknown
    >;
    delete whereWithoutView['view'];

    const adminQuery = {
      ...query,
      where: {
        ...whereWithoutView,
        postStatus:
          view === 'publishing_request'
            ? 'publishing_request'
            : view === 'blocked'
              ? 'blocked'
              : view === 'rejected'
                ? 'rejected'
                : view === 'published'
                  ? 'published'
                  : { not: 'draft' },
      },
      include: {
        ...(query.include || {}),
        shop: {
          select: {
            id: true,
            shopName: true,
            shopLogo: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    };

    const response = await executeQuery<JournalListItem>(
      this.prisma.shopJournal,
      adminQuery,
    );

    const dataWithLikeFlag = response.data.map((journal) => {
      const likes = journal.shopJournalLikes ?? [];

      return {
        ...journal,
        isLikedByCurrentUser: currentUserId
          ? likes.some((like) => like.userId === currentUserId)
          : false,
      };
    });

    return {
      ...response,
      data: dataWithLikeFlag,
    };
  }

  async adminFindOne(id: string, currentUserId?: string) {
    const result = await this.prisma.shopJournal.findUnique({
      where: { id },
      include: {
        shop: {
          select: {
            id: true,
            shopName: true,
            shopLogo: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            shopJournalComments: true,
            shopJournalLikes: true,
          },
        },
        shopJournalComments: {
          include: {
            user: { select: { id: true, fullName: true, avatarUrl: true } },
            shopJournalCommentReplies: {
              include: {
                user: {
                  select: { id: true, fullName: true, avatarUrl: true },
                },
              },
            },
          },
        },
        shopJournalLikes: {
          select: {
            userId: true,
            user: { select: { id: true, fullName: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!result) {
      return null;
    }

    let isLikedByCurrentUser = false;

    if (currentUserId) {
      const liked = await this.prisma.shopJournalLikes.findFirst({
        where: {
          journalId: id,
          userId: currentUserId,
        },
        select: { id: true },
      });

      isLikedByCurrentUser = !!liked;
    }

    return {
      ...result,
      isLikedByCurrentUser,
    };
  }

  async adminUpdateStatus(
    journalId: string,
    action: 'publish' | 'reject' | 'block',
  ) {
    const journal = await this.prisma.shopJournal.findUnique({
      where: { id: journalId },
      select: { id: true },
    });

    if (!journal) {
      throw new Error('Journal entry not found');
    }

    if (action === 'publish') {
      const updated = await this.prisma.shopJournal.update({
        where: { id: journalId },
        data: {
          postStatus: 'published',
          published: true,
          approved: true,
        },
        include: { shop: { select: { user: { select: { id: true } } } } },
      });
      this.eventEmitter.emit('journal.approved', {
        sellerId: updated.shop.user.id,
        journalTitle: updated.title,
        journalId: updated.id,
      });
      return updated;
    }

    if (action === 'block') {
      return await this.prisma.shopJournal.update({
        where: { id: journalId },
        data: {
          postStatus: 'blocked' as never,
          published: false,
          approved: false,
        },
      });
    }

    const rejected = await this.prisma.shopJournal.update({
      where: { id: journalId },
      data: {
        postStatus: 'rejected',
        published: false,
        approved: false,
      },
      include: { shop: { select: { user: { select: { id: true } } } } },
    });
    this.eventEmitter.emit('journal.rejected', {
      sellerId: rejected.shop.user.id,
      journalTitle: rejected.title,
      journalId: rejected.id,
    });
    return rejected;
  }

  async findOne(id: string, currentUserId?: string) {
    const result = await this.prisma.shopJournal.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        shortExcerpt: true,
        bannerImage: true,
        content: true,
        createdAt: true,
        postStatus: true,
        published: true,
        approved: true,
        shop: {
          select: {
            id: true,
            shopName: true,
            shopLogo: true,
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            shopJournalComments: true,
            shopJournalLikes: true,
          },
        },
        shopJournalComments: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { fullName: true, avatarUrl: true } },
            shopJournalCommentReplies: {
              orderBy: { createdAt: 'desc' },
              include: {
                user: { select: { fullName: true, avatarUrl: true } },
              },
            },
          },
        },
        shopJournalLikes: {
          select: {
            userId: true,
            user: { select: { id: true, fullName: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!result) {
      return null;
    }

    let isLikedByCurrentUser = false;

    if (currentUserId) {
      const liked = await this.prisma.shopJournalLikes.findFirst({
        where: {
          journalId: id,
          userId: currentUserId,
        },
        select: { id: true },
      });

      isLikedByCurrentUser = !!liked;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { shopJournalLikes, ...rest } = result;

    return {
      ...rest,
      isLikedByCurrentUser,
    };
  }

  async update(
    authorId: string,
    journalId: string,
    updateJournalDto: UpdateJournalDto,
  ) {
    const journal = await this.prisma.shopJournal.findUnique({
      where: { id: journalId },
      include: { shop: true },
    });

    if (!journal) {
      throw new Error('Journal entry not found');
    }

    const author = await this.prisma.user.findUnique({
      where: { id: authorId },
      include: { sellerProfile: true },
    });

    if (!author || !author.sellerProfile) {
      throw new Error('Author not found');
    }

    if (journal.shopId !== author.sellerProfile?.id) {
      throw new BadGatewayException(
        'You are not authorized to update this journal',
      );
    }

    const result = await this.prisma.shopJournal.update({
      where: { id: journalId },
      data: {
        ...updateJournalDto,
        published: false,
        approved: false,
      },
    });

    return result;
  }

  async remove(authorId: string, journalId: string) {
    const journal = await this.prisma.shopJournal.findUnique({
      where: { id: journalId },
      include: { shop: true },
    });

    if (!journal) {
      throw new Error('Journal entry not found');
    }

    const author = await this.prisma.user.findUnique({
      where: { id: authorId },
      include: { sellerProfile: true },
    });

    if (!author || !author.sellerProfile) {
      throw new Error('Author not found');
    }

    if (journal.shopId !== author.sellerProfile?.id) {
      throw new BadGatewayException(
        'You are not authorized to delete this journal',
      );
    }

    return await this.prisma.shopJournal.delete({
      where: { id: journalId },
    });
  }

  async likeJournal(journalId: string, userId: string) {
    const admin = await this.isAdmin(userId);

    const journal = await this.prisma.shopJournal.findUnique({
      where: { id: journalId },
    });

    if (!journal) {
      throw new Error('Journal entry not found');
    }

    if (
      !admin &&
      (!journal.approved ||
        !journal.published ||
        journal.postStatus !== 'published')
    ) {
      throw new Error('Journal entry not found');
    }

    const alreadyLiked = await this.prisma.shopJournalLikes.findFirst({
      where: {
        userId,
        journalId: journal.id,
      },
      select: { id: true },
    });

    if (alreadyLiked) {
      throw new Error('You already liked this journal');
    }

    return await this.prisma.shopJournalLikes.create({
      data: {
        userId,
        journalId,
      },
    });
  }

  async unlikeJournal(journalId: string, userId: string) {
    const admin = await this.isAdmin(userId);

    const journal = await this.prisma.shopJournal.findUnique({
      where: { id: journalId },
    });

    if (!journal) {
      throw new Error('Journal entry not found');
    }

    if (
      !admin &&
      (!journal.approved ||
        !journal.published ||
        journal.postStatus !== 'published')
    ) {
      throw new Error('Journal entry not found');
    }

    const like = await this.prisma.shopJournalLikes.findFirst({
      where: {
        userId,
        journalId: journal.id,
      },
    });

    if (!like) {
      throw new Error('You have not liked this journal');
    }

    return await this.prisma.shopJournalLikes.delete({
      where: {
        id: like.id,
      },
    });
  }

  async commentJournal(journalId: string, userId: string, comment: string) {
    const admin = await this.isAdmin(userId);

    const journal = await this.prisma.shopJournal.findUnique({
      where: { id: journalId },
    });

    if (!journal) {
      throw new Error('Journal entry not found');
    }

    if (
      !admin &&
      (!journal.approved ||
        !journal.published ||
        journal.postStatus !== 'published')
    ) {
      throw new Error('Journal entry not found');
    }

    return await this.prisma.shopJournalComment.create({
      data: {
        userId,
        journalId,
        comment,
      },
    });
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.shopJournalComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new BadGatewayException(
        'You are not authorized to delete this comment',
      );
    }

    return await this.prisma.shopJournalComment.delete({
      where: { id: commentId },
    });
  }

  async replyToComment(commentId: string, userId: string, reply: string) {
    const comment = await this.prisma.shopJournalComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    return await this.prisma.shopJournalCommentReply.create({
      data: {
        userId,
        commentId,
        reply,
      },
    });
  }

  async deleteReply(replyId: string, userId: string) {
    const reply = await this.prisma.shopJournalCommentReply.findUnique({
      where: { id: replyId },
    });

    if (!reply) {
      throw new Error('Reply not found');
    }

    if (reply.userId !== userId) {
      throw new BadGatewayException(
        'You are not authorized to delete this reply',
      );
    }

    return await this.prisma.shopJournalCommentReply.delete({
      where: { id: replyId },
    });
  }
}
