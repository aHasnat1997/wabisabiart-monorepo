

export interface JournalCommentReplyRaw {
  id: string;
  userId: string;
  commentId: string;
  reply: string;
  createdAt?: string;
  user?: { fullName?: string; avatarUrl?: string };
}

export interface JournalCommentRaw {
  id: string;
  userId: string;
  journalId: string;
  comment: string;
  createdAt?: string;
  user?: { fullName?: string; avatarUrl?: string };
  shopJournalCommentReplies?: JournalCommentReplyRaw[];
}

export interface Journal {
  id: string;
  shopId?: string;
  title: string;
  bannerImage?: string;
  shortExcerpt?: string;
  content: string;
  published?: boolean;
  approved?: boolean;
  postStatus: string;
  createdAt: string;
  _count?: {
    shopJournalComments?: number;
    shopJournalLikes?: number;
  };
  
  shopJournalComments?: JournalCommentRaw[];
  shopJournalLikes?: { user: { fullName?: string; avatarUrl?: string } }[];
  isLikedByCurrentUser?: boolean;
}

export interface JournalPostResponse {
  success: boolean;
  data: Journal;
}

export interface JournalPostStats {
  total?: number;
  published?: number;
  draft?: number;
  totalPublishedPosts?: number;
  totalViews?: number;
  totalLikes?: number;
  totalComments?: number;
  [key: string]: unknown;
}

export interface CommentUser {
  fullName?: string;
  avatarUrl?: string;
}

export interface CommentReply {
  id: string;
  userId: string;
  commentId: string;
  reply: string;
  createdAt: string;
  user?: CommentUser;
}

export interface PostComment {
  id: string;
  userId: string;
  journalId: string;
  comment: string;
  createdAt: string;
  user?: CommentUser;
  shopJournalCommentReplies: CommentReply[];
}

// Backend Response Interfaces (Mapping safety)
export interface APIResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface BackendComment {
  id: string;
  userId: string;
  journalId: string;
  comment?: string;
  content?: string; // Fallback key
  createdAt?: string;
  user?: CommentUser;
}

export interface BackendReply {
  id: string;
  userId: string;
  commentId: string;
  reply?: string;
  content?: string; // Fallback key
  createdAt?: string;
  user?: CommentUser;
}