import { getConversations } from "@/lib/auth-server";
import { Conversation } from "@/types/chat";
import { useEffect, useState } from "react";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getConversations()
      .then(setConversations)
      .catch(() => setError("Conversations load হয়নি"))
      .finally(() => setLoading(false));
  }, []);

  return { conversations, loading, error };
}
