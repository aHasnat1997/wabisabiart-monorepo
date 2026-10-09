import { api } from './axios.js';

export type AdminJournalStatus =
  | 'draft'
  | 'published'
  | 'archived'
  | 'publishing_request'
  | 'rejected'
  | 'blocked';

export interface AdminJournalListItem {
  id: string;
  title: string;
  bannerImage?: string;
  shortExcerpt?: string;
  content: string;
  postStatus?: AdminJournalStatus;
  published?: boolean;
  approved?: boolean;
  createdAt: string;
  shop?: {
    id: string;
    shopName: string;
    shopLogo?: string;
    user?: {
      id: string;
      fullName: string;
      email: string;
      avatarUrl?: string;
    };
  };
  _count?: {
    shopJournalLikes?: number;
    shopJournalComments?: number;
  };
}

export interface AdminJournalReply {
  id: string;
  reply: string;
  userId: string;
  user: { id: string; fullName: string; avatarUrl?: string };
}

export interface AdminJournalComment {
  id: string;
  comment: string;
  userId: string;
  user: { id: string; fullName: string; avatarUrl?: string };
  shopJournalCommentReplies: AdminJournalReply[];
}

export interface AdminJournalLike {
  userId: string;
  user: { id: string; fullName: string; avatarUrl?: string };
}

export interface AdminJournalDetail extends AdminJournalListItem {
  isLikedByCurrentUser: boolean;
  shopJournalComments: AdminJournalComment[];
  shopJournalLikes: AdminJournalLike[];
}

export const adminJournalApi = {
  getAll: (params?: Record<string, string>) =>
    api.get<{
      meta: {
        page: number;
        limit: number;
        totalData: number;
      };
      data: AdminJournalListItem[];
    }>('/journal/admin', { params }),
  getOne: (journalId: string) =>
    api.get<{ data: AdminJournalDetail }>(`/journal/admin/${journalId}`),
  updateStatus: (journalId: string, action: 'publish' | 'reject' | 'block') =>
    api.patch(`/journal/admin/${journalId}/status`, { action }),
  react: (journalId: string, action: 'like' | 'unlike') =>
    api.post(`/journal/like-unlike/${journalId}`, undefined, {
      params: { action },
    }),
  comment: (journalId: string, content: string) =>
    api.post(`/journal/comment/${journalId}`, { content }),
  reply: (commentId: string, content: string) =>
    api.post(`/journal/reply/${commentId}`, { content }),
};
