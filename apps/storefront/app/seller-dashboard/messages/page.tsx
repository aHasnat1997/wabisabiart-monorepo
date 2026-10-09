import { getConversations, profileInfo } from "@/lib/auth-server";
import { MessagesClient } from "./_component/MessagesClient";

export default async function MessagesPage() {
  const conversations = await getConversations();
  const user = await profileInfo();

  return (
    <MessagesClient CURRENT_USER_ID={user?.id} conversations={conversations} />
  );
}
