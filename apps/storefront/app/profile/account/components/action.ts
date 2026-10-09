"use server";

import { apiFetch } from "@/lib/apiFetch";
import { SessionsResponse } from "@/types/auth";
import { PaymentMethodsResponse } from "@/types/cards";

export async function getSavedCards() {
  try {
    const response = await apiFetch<PaymentMethodsResponse>(
      "/stripe/payment-methods",
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching saved cards:", error);
  }
}

export async function deleteCard(pmId: string) {
  try {
    const response = await apiFetch<{ success: boolean; message: string }>(
      `/stripe/payment-methods/${pmId}`,
      {
        method: "DELETE",
      },
    );
    return response;
  } catch (error) {
    console.error("Error deleting card:", error);
    throw new Error("Failed to delete card");
  }
}

export async function getAllSessions() {
  try {
    const response = await apiFetch<SessionsResponse>("/auth/sessions");
    return response.data;
  } catch (error) {
    console.error("Error fetching sessions:", error);
  }
}

export async function signoutAllSessions() {
  try {
    const response = await apiFetch<{ success: boolean; message: string }>(
      "/auth/sessions/all",
      {
        method: "DELETE",
      },
    );
    return response;
  } catch (error) {
    console.error("Error signing out from all sessions:", error);
  }
}

export async function signoutSession(sessionId: string) {
  try {
    const response = await apiFetch<{ success: boolean; message: string }>(
      `/auth/sessions/${sessionId}`,
      {
        method: "DELETE",
      },
    );
    return response;
  } catch (error) {
    console.error("Error signing out from session:", error);
  }
}