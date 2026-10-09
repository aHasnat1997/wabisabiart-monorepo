"use server";

import { apiFetch } from "@/lib/apiFetch";
import { JournalResponse, JournalsResponse } from "@/types/journal";
import { revalidatePath } from "next/cache";

export async function getAllJournals(page: number = 1, limit: number = 5) {
  try {
    // URL e page ebong limit duto-i thakte hobe
    const data = await apiFetch<JournalsResponse>(`/journal?page=${page}&limit=${limit}`);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getJournalById(id: string) {
  try {
    const data = await apiFetch<JournalResponse>(`/journal/${id}`);
    return data.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function updateLike(id: string, action: "like" | "unlike") {
  try {
    const res = await apiFetch<{ success: boolean; message: string }>(
      `/journal/like-unlike/${id}?action=${action}`,
      {
        method: "POST",
      },
    );
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function addComment(journalId: string, content: string) {
  try {
    const comment = content.trim();
    const res = await apiFetch<{ success: boolean; message: string }>(
      `/journal/comment/${journalId}`,
      {
        method: "POST",
        body: {
          comment,
          content: comment,
        },
      },
    );
    revalidatePath(`/blog/${journalId}`);
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function addReply(commentId: string, content: string) {
  try {
    const comment = content.trim();
    const res = await apiFetch<{ success: boolean; message: string }>(
      `/journal/reply/${commentId}`,
      {
        method: "POST",
        body: {
          comment,
          content: comment,
        },
      },
    );
    revalidatePath(`/blog/${commentId}`);
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
