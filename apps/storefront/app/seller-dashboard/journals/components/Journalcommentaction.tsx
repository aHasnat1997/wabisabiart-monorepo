// journalCommentAction.ts
// ✅ NO "use server" — ye functions client component se directly call hote hain
// Server Actions (JusnalAction.ts) sirf form/mutation ke liye hain
// Comment/Reply ke liye direct API calls yahan hain

import { apiFetch } from "@/lib/apiFetch";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES  — exact API response shapes
// ─────────────────────────────────────────────────────────────────────────────

export interface JournalReply {
  id: string;
  userId: string;
  commentId: string;
  reply: string;
  createdAt: string;
  user?: { name: string; profileImage?: string };
}

export interface JournalComment {
  id: string;
  userId: string;
  journalId: string;
  comment: string;
  createdAt: string;
  user?: { name: string; profileImage?: string };
  replies?: JournalReply[];
}

// Raw API shapes (fields may be missing)
interface RawReply {
  id: string;
  userId?: string;
  commentId?: string;
  reply: string;
  createdAt?: string;
  user?: { name: string; profileImage?: string };
}

interface RawComment {
  id: string;
  userId?: string;
  journalId?: string;
  comment: string;
  createdAt?: string;
  user?: { name: string; profileImage?: string };
  replies?: RawReply[];
}

// Normalize — fill missing fields with safe defaults
const toReply = (r: RawReply, commentId: string): JournalReply => ({
  id: r.id,
  userId: r.userId ?? "",
  commentId: r.commentId ?? commentId,
  reply: r.reply,
  createdAt: r.createdAt ?? new Date().toISOString(),
  user: r.user,
});

const toComment = (c: RawComment, journalId: string): JournalComment => ({
  id: c.id,
  userId: c.userId ?? "",
  journalId: c.journalId ?? journalId,
  comment: c.comment,
  createdAt: c.createdAt ?? new Date().toISOString(),
  user: c.user,
  replies: (c.replies ?? []).map((r) => toReply(r, c.id)),
});

// ─────────────────────────────────────────────────────────────────────────────
// COMMENT ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /journal/comment/:journalId
 */
export const getJournalComments = async (
  journalId: string
): Promise<JournalComment[]> => {
  const res = await apiFetch<{
    success: boolean;
    data: RawComment[] | { data: RawComment[] };
  }>(`/journal/comment/${journalId}`, { method: "GET" });

  // Handle both { data: [] } and { data: { data: [] } }
  const raw: RawComment[] = Array.isArray(res.data)
    ? res.data
    : Array.isArray((res.data as { data?: RawComment[] })?.data)
      ? (res.data as { data: RawComment[] }).data
      : [];

  return raw.map((c) => toComment(c, journalId));
};

/**
 * POST /journal/comment/:journalId
 * Body: { comment: string }
 */
export const postJournalComment = async (
  journalId: string,
  comment: string
): Promise<JournalComment> => {
  const res = await apiFetch<{ success: boolean; data: RawComment }>(
    `/journal/comment/${journalId}`,
    { method: "POST", body: { comment } }
  );
  return toComment(res.data, journalId);
};

/**
 * DELETE /journal/comment/:commentId
 */
export const deleteJournalComment = async (
  commentId: string
): Promise<void> => {
  await apiFetch(`/journal/comment/${commentId}`, { method: "DELETE" });
};

// ─────────────────────────────────────────────────────────────────────────────
// REPLY ACTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /journal/reply/:commentId
 * Body: { reply: string }
 */
export const postJournalReply = async (
  commentId: string,
  reply: string
): Promise<JournalReply> => {
  const res = await apiFetch<{ success: boolean; data: RawReply }>(
    `/journal/reply/${commentId}`,
    { method: "POST", body: { reply } }
  );
  return toReply(res.data, commentId);
};

/**
 * DELETE /journal/reply/:replyId
 */
export const deleteJournalReply = async (replyId: string): Promise<void> => {
  await apiFetch(`/journal/reply/${replyId}`, { method: "DELETE" });
};