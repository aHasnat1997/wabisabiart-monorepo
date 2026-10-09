import { getConversations, profileInfo } from "@/lib/auth-server";
import { InboxClient } from "./_components/InboxClient";
import { redirect } from "next/navigation";

export default async function InboxPage() {
  const user = await profileInfo();

  if (!user) {
    redirect("/");
  }
  const conversations = await getConversations();
  return (
    <InboxClient CURRENT_USER_ID={user?.id} conversations={conversations} />
  );
}
