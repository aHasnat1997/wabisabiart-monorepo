import { useEffect, useRef, useState, useCallback } from "react";
import {
  getMessages,
  markConversationRead,
  getAccessToken,
} from "@/lib/auth-server";
import { Message, SendMessagePayload } from "@/types/chat";
import { getSocket, disconnectSocket } from "@/lib/socket";

export function useChat(
  conversationId: string,
  currentUserId: string,
  currentUser: Message["sender"],
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [connected, setConnected] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Initial messages load ────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    getMessages(conversationId, 1)
      .then((data) => {
        if (cancelled) return;
        setMessages(data);
        setHasMore(data.length === 30);
      })
      .catch((err) => console.error("[useChat] Failed to fetch messages:", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      setLoading(true);
    };
  }, [conversationId]);

  // ─── WebSocket ────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const token = await getAccessToken();

      if (!token) {
        console.error("[useChat] ❌ No access token — cannot connect socket");
        return;
      }

      if (cancelled) return;

      const socket = getSocket(token);

      // ── Helpers ──
      const joinAndRead = () => {
        socket.emit("joinConversation", { conversationId });
        socket.emit("markAsRead", { conversationId }); // ✅ join হলেই read mark
        markConversationRead(conversationId);
      };

      // ── Handlers ──
      const handleConnect = () => {
        console.log("[useChat] ✅ Connected — joining room:", conversationId);
        setConnected(true);
        joinAndRead();
      };

      const handleDisconnect = (reason: string) => {
        console.warn("[useChat] ⚠️ Disconnected:", reason);
        setConnected(false);
      };

      const handleConnectError = (err: Error) => {
        console.error("[useChat] ❌ Connection error:", err.message);
      };

      const handleError = (err: { message: string }) => {
        console.error("[useChat] ❌ Server error:", err);
      };

      const handleNewMessage = (msg: Message) => {
        console.log("[useChat] 🔥 newMessage received:", msg);
        if (msg.conversationId === conversationId) {
          setMessages((prev) => {
            const withoutOptimistic = prev.filter(
              (m) => !(m.id.startsWith("temp-") && m.content === msg.content),
            );
            return [...withoutOptimistic, msg];
          });
          // ✅ নতুন message আসলে সাথে সাথে read mark করো
          socket.emit("markAsRead", { conversationId });
          markConversationRead(conversationId);
        }
      };

      const handleTyping = ({
        isTyping,
        userId,
      }: {
        userId: string;
        isTyping: boolean;
      }) => {
        if (userId === currentUserId) return;
        setIsTyping(isTyping);
      };

      const handleMessagesRead = () => {
        setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
      };

      // ── Register listeners ──
      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);
      socket.on("connect_error", handleConnectError);
      socket.on("error", handleError);
      socket.on("newMessage", handleNewMessage);
      socket.on("userTyping", handleTyping);
      socket.on("messagesRead", handleMessagesRead);

      // ── Already connected → join immediately ──
      if (socket.connected) {
        console.log(
          "[useChat] Already connected — joining room:",
          conversationId,
        );
        setConnected(true);
        joinAndRead();
      } else {
        console.log("[useChat] Connecting...");
        socket.connect();
      }

      return () => {
        console.log("[useChat] Cleanup — leaving room:", conversationId);
        socket.emit("leaveConversation", { conversationId });
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
        socket.off("connect_error", handleConnectError);
        socket.off("error", handleError);
        socket.off("newMessage", handleNewMessage);
        socket.off("userTyping", handleTyping);
        socket.off("messagesRead", handleMessagesRead);
      };
    };

    let cleanup: (() => void) | undefined;
    init().then((fn) => {
      if (!cancelled) cleanup = fn;
      else fn?.();
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [conversationId, currentUserId]);

  // ─── Send Message ─────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (payload: Omit<SendMessagePayload, "conversationId">) => {
      const token = await getAccessToken();
      if (!token) {
        console.error("[useChat] ❌ No token — cannot send message");
        return;
      }

      const socket = getSocket(token);

      // Optimistic update
      const optimisticMsg: Message = {
        id: `temp-${Date.now()}`,
        conversationId,
        senderId: currentUserId,
        content: payload.content,
        attachments: payload.attachments ?? [],
        isRead: false,
        readAt: null,
        createdAt: new Date().toISOString(),
        sender: currentUser,
      };
      setMessages((prev) => [...prev, optimisticMsg]);

      const emit = () => {
        socket.emit("joinConversation", { conversationId });
        console.log("[useChat] Emitting sendMessage:", {
          conversationId,
          ...payload,
        });
        socket.emit("sendMessage", { conversationId, ...payload });
      };

      if (socket.connected) {
        emit();
      } else {
        console.warn("[useChat] Not connected — waiting...");
        socket.once("connect", emit);
        socket.connect();
      }
    },
    [conversationId, currentUserId, currentUser],
  );

  // ─── Typing ───────────────────────────────────────────────────────────────
  const sendTyping = useCallback(
    (typing: boolean) => {
      const socket = getSocket();
      if (!socket.connected) return;

      socket.emit("typing", { conversationId, isTyping: typing });

      if (typing) {
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => {
          socket.emit("typing", { conversationId, isTyping: false });
        }, 2000);
      }
    },
    [conversationId],
  );

  // ─── Load More ────────────────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!hasMore) return;
    const nextPage = page + 1;
    try {
      const older = await getMessages(conversationId, nextPage);
      setMessages((prev) => [...older, ...prev]);
      setPage(nextPage);
      setHasMore(older.length === 30);
    } catch (err) {
      console.error("[useChat] Failed to load more messages:", err);
    }
  }, [conversationId, page, hasMore]);

  // ─── Create Conversation ──────────────────────────────────────────────────
  const createConversation = useCallback(
    async (payload: {
      conversationId?: string;
      receiverId?: string;
      orderId?: string;
      productId?: string;
      type?:
        | "general"
        | "order_inquiry"
        | "refund_request"
        | "product_inquiry"
        | "support";
    }) => {
      const token = await getAccessToken();
      if (!token) {
        console.error("[useChat] ❌ No token — cannot create conversation");
        return;
      }

      const socket = getSocket(token);

      const emit = () => {
        console.log("[useChat] Emitting createConversation:", payload);
        socket.emit("createConversation", {
          type: "general", // default
          ...payload,
        });
      };

      if (socket.connected) {
        emit();
      } else {
        socket.once("connect", emit);
        socket.connect();
      }
    },
    [],
  );

  return {
    messages,
    isTyping,
    loading,
    hasMore,
    connected,
    sendMessage,
    sendTyping,
    loadMore,
    createConversation,
  };
}