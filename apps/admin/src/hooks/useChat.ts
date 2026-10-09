import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments: string[];
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  sender: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    role: string;
  };
}

export interface Conversation {
  id: string;
  type: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  customerId: string | null;
  sellerId: string | null;
  customer: { id: string; fullName: string; avatarUrl: string | null } | null;
  seller: { id: string; shopName: string; shopLogo: string | null } | null;
}

export function useChat() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const socket = io('/chat', {
      withCredentials: true,
      path: '/socket.io',
    });

    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('newMessage', (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.conversationId
            ? { ...c, lastMessage: msg.content, lastMessageAt: msg.createdAt }
            : c,
        ),
      );
      fetchUnreadCount();
    });

    socket.on('userTyping', ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      setTypingUsers((prev) => ({ ...prev, [userId]: isTyping }));
    });

    socket.on('messagesRead', ({ conversationId }: { conversationId: string }) => {
      setMessages((prev) =>
        prev.map((m) => (m.conversationId === conversationId ? { ...m, isRead: true } : m)),
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/chat/conversations', { credentials: 'include' });
      if (!res.ok) return;
      const json = await res.json();
      const list = json.data ?? json;
      setConversations(Array.isArray(list) ? list : []);
    } catch {
      setConversations([]);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const res = await fetch(`/api/v1/chat/conversations/${conversationId}/messages`, {
        credentials: 'include',
      });
      if (!res.ok) return;
      const json = await res.json();
      const list = json.data ?? json;
      setMessages(Array.isArray(list) ? list : []);
    } catch {
      setMessages([]);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/chat/unread-count', { credentials: 'include' });
      if (!res.ok) return;
      const json = await res.json();
      setUnreadCount(typeof json.data === 'number' ? json.data : 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  const openConversation = useCallback(
    async (conversation: Conversation) => {
      if (activeConversation?.id === conversation.id) return;

      if (activeConversation) {
        socketRef.current?.emit('leaveConversation', { conversationId: activeConversation.id });
      }

      setActiveConversation(conversation);
      setMessages([]);
      await fetchMessages(conversation.id);

      socketRef.current?.emit('joinConversation', { conversationId: conversation.id });
      socketRef.current?.emit('markAsRead', { conversationId: conversation.id });

      await fetch(`/api/v1/chat/conversations/${conversation.id}/read`, {
        method: 'POST',
        credentials: 'include',
      });
      fetchUnreadCount();
    },
    [activeConversation, fetchMessages, fetchUnreadCount],
  );

  const sendMessage = useCallback(
    (content: string, receiverId?: string, type = 'support') => {
      if (!socketRef.current || !content.trim()) return;

      const payload: Record<string, unknown> = { content, type, attachments: [] };
      if (activeConversation) {
        payload.conversationId = activeConversation.id;
      } else if (receiverId) {
        payload.receiverId = receiverId;
      }

      socketRef.current.emit('sendMessage', payload);
    },
    [activeConversation],
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!activeConversation) return;
      socketRef.current?.emit('typing', {
        conversationId: activeConversation.id,
        isTyping,
      });
    },
    [activeConversation],
  );

  useEffect(() => {
    fetchConversations();
    fetchUnreadCount();
  }, [fetchConversations, fetchUnreadCount]);

  return {
    connected,
    conversations,
    messages,
    activeConversation,
    unreadCount,
    typingUsers,
    openConversation,
    sendMessage,
    sendTyping,
    fetchConversations,
  };
}
