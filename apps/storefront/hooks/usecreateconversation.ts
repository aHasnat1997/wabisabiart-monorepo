"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { getAccessToken } from "@/lib/auth-server";

interface CreateConversationPayload {
  receiverId?: string;
  orderId?: string;
  productId?: string;
  type?:
    | "general"
    | "order_inquiry"
    | "refund_request"
    | "product_inquiry"
    | "support";
}

interface ConversationCreatedResponse {
  id: string;
  type: string;
}

export function useCreateConversation() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const createAndRedirect = useCallback(
    async (payload: CreateConversationPayload) => {
      setLoading(true);

      try {
        const token = await getAccessToken();
        if (!token) {
          console.error("[useCreateConversation] ❌ No token");
          return;
        }

        const socket = getSocket(token);

        const emit = () => {
          console.log(
            "[useCreateConversation] Emitting createConversation:",
            payload,
          );

          socket.emit(
            "createConversation",
            { type: "general", ...payload },
            // ✅ server থেকে ack callback — conversation id পাবো
            (response: ConversationCreatedResponse) => {
              console.log("[useCreateConversation] ✅ Created:", response);
              router.push(`/profile/inbox?conversationId=${response.id}`);
              setLoading(false);
            },
          );

          // ✅ fallback — ack না আসলে শুধু inbox এ redirect
          setTimeout(() => {
            setLoading(false);
            router.push("/profile/inbox");
          }, 3000);
        };

        if (socket.connected) {
          emit();
        } else {
          socket.once("connect", emit);
          socket.connect();
        }
      } catch (err) {
        console.error("[useCreateConversation] ❌ Error:", err);
        setLoading(false);
      }
    },
    [router],
  );

  return { createAndRedirect, loading };
}
