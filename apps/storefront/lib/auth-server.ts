"use server";

import { cookies } from "next/headers";
import { apiFetch } from "./apiFetch";
import { IUserProfileResponse, ShopSetupPayload } from "@/types/auth";
import { AddressListResponse } from "@/types/address";
import { revalidatePath } from "next/cache";
import { ApiResponse, Conversation, Message } from "@/types/chat";
import { LegalPageResponse } from "@/types/contact";

export const isUser = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("wsa-access-token")?.value;
  return !accessToken || accessToken?.length === 0 ? false : true;
};

// set up shop ------------------------------------------------------
export const setUpShop = async (values: ShopSetupPayload) => {
  try {
    const data = await apiFetch<{ success: boolean }>("/user/setup-shop", {
      method: "POST",
      body: values,
    });
    return data?.success;
  } catch (error) {
    console.error("Create product error:", error);
    throw error;
  }
};

// enable two step
export const enableTwoStep = async ({
  userId,
  provider,
}: {
  userId: string;
  provider: string;
}) => {
  try {
    const data = await apiFetch<{ success: boolean }>(
      "/user/two-factor-otp",
      {
        method: "POST",
        body: { userId, provider },
      },
    );
    return data?.success;
  } catch (error) {
    console.error("Create user error:", error);
    throw error;
  }
};


export const toggleTwoStep = async ({
  otp,
  provider,
  twoFActorEnable,
  userId,
}: {
  otp: string;
  twoFActorEnable: boolean;
  provider: string;
  userId: string;
}) => {
  try {
    const data = await apiFetch<{ success: boolean }>(
      "/user/toggle-two-factor-verification",
      {
        method: "POST",
        body: { userId, otp, provider, twoFActorEnable },
      },
    );
    return data?.success;
  } catch (error) {
    console.error("Create user error:", error);
    throw error;
  }
};


// profile info------------------------------------------------------------
export async function profileInfo() {
  try {
    const data = await apiFetch<IUserProfileResponse>("/user/profile");
    return data?.data;
  } catch (error) {
    console.error("profileInfo failed:", error);
    return null;
  }
}

export const updateProfile = async (data: {
  fullName?: string;
  dob?: string;
  avatarUrl?: string;
}) => {
  try {
    const res = await apiFetch<{ success: boolean; message: string }>(
      "/user/profile",
      {
        method: "PATCH",
        body: data,
      },
    );
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Address 
export async function addAddress(data: {
  fullName: string;
  stateProvince: string;
  addressLine1?: string;
  city: string;
  postalCode?: string;
  country: string;
  phoneNumber: string;
  label?: string;
  isDefaultShipping?: boolean;
}) {
  try {
    const res = await apiFetch<{ success: boolean; message: string }>(
      "/address",
      {
        method: "POST",
        body: data,
      },
    );
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function getAddress() {
  try {
    const res = await apiFetch<AddressListResponse>("/address");
    return res?.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function deleteAddress(id: string) {
  try {
    const res = await apiFetch<{ success: boolean; message: string }>(
      `/address/${id}`,
      {
        method: "DELETE",
      },
    );
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function setDefaultAddress(id: string) {
  try {
    const res = await apiFetch<{success: boolean; message: string}>(`/address/default/${id}?type=shipping`, {
      method: "PATCH",
    });
    revalidatePath("/profile/cart/check-out");
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("wsa-access-token")?.value ?? null;
}


// chat API actions

// GET /chat/conversations
export async function getConversations(): Promise<Conversation[]> {
  const res = await apiFetch<ApiResponse<Conversation[]>>("/chat/conversations");
  return res.data;
}

// GET /chat/conversations/:id/messages?page=1&limit=30
export async function getMessages(
  conversationId: string,
  page = 1,
  limit = 30
): Promise<Message[]> {
  const res = await apiFetch<ApiResponse<Message[]>>(
    `/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
  );
  return res.data;
}

// unread-count → data সরাসরি number
export async function getUnreadCount(): Promise<number> {
  const res = await apiFetch<ApiResponse<number>>("/chat/unread-count");
  return res.data; // ← .count নয়, সরাসরি res.data
}

// mark as read → data: { count: number }
export async function markConversationRead(conversationId: string): Promise<number> {
  const res = await apiFetch<ApiResponse<{ count: number }>>(
    `/chat/conversations/${conversationId}/read`,
    { method: "POST" }
  );
  return res.data.count;
}


// legals data

export async function getLeagalData(type: string) {
  try {
    const res = await apiFetch<LegalPageResponse>(`/legals/${type}`);
    return res?.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}