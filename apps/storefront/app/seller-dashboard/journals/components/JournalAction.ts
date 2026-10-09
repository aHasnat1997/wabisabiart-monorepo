"use server";

import { apiFetch } from "@/lib/apiFetch";
import { revalidateJournals } from "./JurnalServer";
import { PostFormValues } from "./CreatePostSchema";
import {
  APIResponse,
  BackendComment,
  BackendReply,
  CommentReply,
  Journal,
  JournalPostResponse,
  JournalPostStats,
  PostComment,
} from "@/types/sellerDashboard/JournalsItems";

// ─── Image Resolve ────────────────────────────────────────────────────────────

const resolveBannerImage = (
  existingImageUrl: string | null | undefined
): string | null => {
  return existingImageUrl ?? null;
};

// ─── Create ───────────────────────────────────────────────────────────────────

export const createJournalPost = async (
  data: PostFormValues,
  imageBase64: string | null,
  imageName: string | null,
  status: "draft" | "published",
  existingImageUrl?: string | null
): Promise<JournalPostResponse> => {
  try {
    const bannerImage = resolveBannerImage(existingImageUrl);

    const response = await apiFetch<JournalPostResponse>("/journal", {
      method: "POST",
      body: {
        title: data.title,
        shortExcerpt: data.excerpt || "",
        content: data.content,
        postStatus: status === "published" ? "publishing_request" : "draft",
        ...(bannerImage ? { bannerImage } : {}),
      },
    });

    await revalidateJournals();
    return response;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Something went wrong";
    console.error("JOURNAL ERROR:", message);
    throw new Error(message);
  }
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getJournalPost = async (): Promise<Journal[]> => {
  try {
    const data = await apiFetch<{ success: boolean; data: Journal[] }>(
      "/journal/my",
      { method: "GET" }
    );
    return data.data ?? [];
  } catch (error) {
    console.error("Failed to fetch post", error);
    throw error;
  }
};

export const getJournalPostStats = async (): Promise<JournalPostStats> => {
  try {
    const data = await apiFetch<{ success: boolean; data: JournalPostStats }>(
      "/journal/my/status",
      { method: "GET" }
    );
    return data.data;
  } catch (error) {
    console.error("Failed to fetch stats", error);
    throw error;
  }
};

export const getJournalById = async (id: string): Promise<Journal> => {
  try {
    const data = await apiFetch<{ success: boolean; data: Journal }>(
      `/journal/${id}`,
      { method: "GET" }
    );
    return data.data;
  } catch (error) {
    console.error("Failed to fetch journal by id", error);
    throw error;
  }
};

// ─── Like / Unlike ────────────────────────────────────────────────────────────

export const likeUnlikeJournal = async (
  id: string,
  action: "like" | "unlike"
): Promise<void> => {
  try {
    await apiFetch(`/journal/like-unlike/${id}?action=${action}`, {
      method: "POST",
    });
    await revalidateJournals();
  } catch (error) {
    console.error("Like/unlike error:", error);
    throw error;
  }
};

// ─── Comments ─────────────────────────────────────────────────────────────────

export const postJournalComment = async (
  journalId: string,
  comment: string
): Promise<PostComment> => {
  try {
    const res = await apiFetch<APIResponse<BackendComment>>(
      `/journal/comment/${journalId}`,
      {
        method: "POST",
        body: {
          comment: comment.trim(),
          content: comment.trim(),
        },
      }
    );

    if (!res || !res.success) {
      throw new Error(res?.message || "Prisma failed to create comment");
    }

    const item = res.data;

    return {
      id: item.id,
      userId: item.userId,
      journalId: item.journalId,
      comment: item.comment || item.content || "",
      createdAt: item.createdAt ?? new Date().toISOString(),
      shopJournalCommentReplies: [],
      user: item.user
        ? { fullName: item.user.fullName, avatarUrl: item.user.avatarUrl }
        : { fullName: "You", avatarUrl: "" },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to post comment";
    console.error("COMMENT ERROR:", message);
    throw new Error(message);
  }
};

// ─── Replies ──────────────────────────────────────────────────────────────────

export const postJournalReply = async (
  commentId: string,
  reply: string
): Promise<CommentReply> => {
  try {
    const res = await apiFetch<APIResponse<BackendReply>>(
      `/journal/reply/${commentId}`,
      {
        method: "POST",
        body: {
          reply: reply.trim(),
          content: reply.trim(),
        },
      }
    );

    if (!res || !res.success) {
      throw new Error(res?.message || "Failed to post reply");
    }

    const item = res.data;

    return {
      id: item.id,
      userId: item.userId,
      commentId: item.commentId,
      reply: item.reply || item.content || "",
      createdAt: item.createdAt ?? new Date().toISOString(),
      user: item.user
        ? { fullName: item.user.fullName, avatarUrl: item.user.avatarUrl }
        : { fullName: "You", avatarUrl: "" },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to post reply";
    console.error("REPLY ERROR:", message);
    throw new Error(message);
  }
};

// ─── Update ───────────────────────────────────────────────────────────────────

export const updateJournalPost = async (
  id: string,
  data: PostFormValues,
  imageBase64: string | null,
  imageName: string | null,
  status: "draft" | "published",
  existingImageUrl?: string | null
): Promise<JournalPostResponse> => {
  try {
    const bannerImage = resolveBannerImage(existingImageUrl);

    const response = await apiFetch<JournalPostResponse>(`/journal/${id}`, {
      method: "PATCH",
      body: {
        title: data.title,
        shortExcerpt: data.excerpt || "",
        content: data.content,
        postStatus: status === "published" ? "publishing_request" : "draft",
        bannerImage: bannerImage,
      },
    });

    await revalidateJournals();
    return response;
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : "Update failed");
  }
};

// ─── Delete ───────────────────────

export const deleteJournalPost = async (id: string): Promise<void> => {
  try {
    await apiFetch<APIResponse<null>>(`/journal/${id}`, { method: "DELETE" });
    await revalidateJournals();
  } catch (error) {
    console.error("Failed to delete journal post:", error);
    throw error;
  }
};

export const deleteJournalComment = async (commentId: string): Promise<void> => {
  try {
    await apiFetch<APIResponse<null>>(`/journal/comment/${commentId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Failed to delete comment:", error);
    throw error;
  }
};

export const deleteJournalReply = async (replyId: string): Promise<void> => {
  try {
    await apiFetch<APIResponse<null>>(`/journal/reply/${replyId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("Failed to delete reply:", error);
    throw error;
  }
};