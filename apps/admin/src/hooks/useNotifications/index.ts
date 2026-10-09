import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../../api/axios.js';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const esRef = useRef<EventSource | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const res = await api.get<{ data: Notification[] }>('/notification');
      const list = res.data.data ?? [];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.isRead).length);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchAll();

    const base = import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL}/api/v1`
      : '/api/v1';

    esRef.current = new EventSource(`${base}/notification/stream`, {
      withCredentials: true,
    });

    esRef.current.onmessage = (e: MessageEvent) => {
      try {
        const event = JSON.parse(e.data as string) as Omit<Notification, 'id' | 'isRead' | 'createdAt'>;
        const newNotif: Notification = {
          id: crypto.randomUUID(),
          isRead: false,
          createdAt: new Date().toISOString(),
          ...event,
        };
        setNotifications((prev) => [newNotif, ...prev]);
        setUnreadCount((c) => c + 1);
      } catch {
        // ignore
      }
    };

    return () => {
      esRef.current?.close();
    };
  }, [fetchAll]);

  const markRead = useCallback(async (id: string) => {
    try {
      await api.patch(`/notification/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api.patch('/notification/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  }, []);

  return { notifications, unreadCount, markRead, markAllRead, refetch: fetchAll };
}
