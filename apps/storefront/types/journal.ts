// types/journal.ts

// ─── Base ─────────────────────────────────────────────────────────────────────

export interface User {
  id?: string;
  fullName: string;
  avatarUrl: string;
}

export interface Shop {
  id: string;
  shopName: string;
  shopLogo: string;
  user: User;
}

export interface JournalCount {
  shopJournalComments: number;
  shopJournalLikes: number;
}

// ─── Comments & Replies ───────────────────────────────────────────────────────

export interface Reply {
  id: string;
  userId: string;
  commentId: string; // ← "commentId" in API, not "journalId"
  reply: string; // ← API field is "reply", not "comment"
  user: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  userId: string;
  journalId: string;
  comment: string;
  user: { fullName: string; avatarUrl: string };
  createdAt?: string;
  shopJournalCommentReplies: Reply[];
}

// ─── Like ─────────────────────────────────────────────────────────────────────

export interface Like {
  user: User;
}


export interface JournalCardProps {
  image: string;
  date: string;
  author: string;
  title: string;
  excerpt: string;
  href?: string;
}
// ─── Journal (detailed — single item response) ────────────────────────────────

export interface Journal {
  id: string;
  shopId?: string;
  title: string;
  bannerImage: string;
  shortExcerpt: string;
  content: string;
  published: boolean;
  approved: boolean;
  postStatus: "published" | "draft" | "pending" | "archived";
  createdAt: string;
  updatedAt?: string;
  _count: JournalCount;
  shop?: Shop; // only in detail view
  shopJournalComments?: Comment[]; // only in detail view
  shopJournalLikes?: Like[]; // only in detail view
  isLikedByCurrentUser: boolean;
}

// ─── Journal List Item (paginated response) ───────────────────────────────────
// Matches the /api/v1/journal list response exactly.
// No `content`, no `shop`, no `shopJournalComments`, no `shopJournalLikes`.

export interface JournalListItem {
  id: string;
  shopId: string;
  title: string;
  bannerImage: string;
  shortExcerpt: string;
  published: boolean;
  approved: boolean;
  postStatus: Journal["postStatus"];
  createdAt: string;
  _count: JournalCount;
  isLikedByCurrentUser: boolean;
}

// ─── API Response wrappers ────────────────────────────────────────────────────

export interface Meta {
  timestamp: string;
  path: string;
  method: string;
}

export interface PaginatedMeta extends Meta {
  page: number;
  limit: number;
  totalData: number;
  totalPages: number;
  isNextPage: boolean;
  isPreviousPage: boolean;
}

export interface JournalResponse {
  success: boolean;
  message: string;
  meta: Meta;
  data: Journal;
}

export interface JournalsResponse {
  success: boolean;
  message: string;
  meta: PaginatedMeta;
  data: JournalListItem[];
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export interface CreateJournalPayload {
  title: string;
  bannerImage?: string;
  shortExcerpt?: string;
  content: string;
  postStatus?: Journal["postStatus"];
  published?: boolean;
  approved?: boolean;
}

export interface UpdateJournalPayload extends Partial<CreateJournalPayload> {
  id: string;
}

export interface CreateCommentPayload {
  journalId: string;
  comment: string;
}

export interface UpdateCommentPayload {
  id: string;
  comment: string;
}

export interface CreateReplyPayload {
  commentId: string;
  reply: string; // ← matches API field name
}

export interface LikePayload {
  journalId: string;
}
