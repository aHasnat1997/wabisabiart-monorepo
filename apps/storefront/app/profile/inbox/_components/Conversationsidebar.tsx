"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, resolveImageUrl } from "@/lib/utils";
import { Conversation } from "@/types/chat";

interface Props {
  conversations: Conversation[];
  selectedId: string;
  currentUserId: string;
  onSelect: (conversation: Conversation) => void;
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)
    return date.toLocaleDateString("en-US", { weekday: "short" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ConversationSidebar({
  conversations,
  selectedId,
  currentUserId,
  onSelect,
}: Props) {
  return (
    <div>
      <ScrollArea className="h-full md:h-[calc(100vh-19rem)]">
        {conversations.length === 0 && (
          <p className="text-muted-foreground text-sm text-center p-6">
            No conversations yet
          </p>
        )}
        {conversations.map((conversation) => {
          const isCustomer = conversation.customerId === currentUserId;
          const name = isCustomer
            ? conversation.seller.shopName
            : conversation.customer.fullName;
          const avatarSrc = isCustomer
            ? resolveImageUrl(conversation.seller.shopLogo)
            : resolveImageUrl(conversation.customer.avatarUrl);

          return (
            <div
              key={conversation.id}
              onClick={() => onSelect(conversation)}
              className={cn(
                "p-3 border-b cursor-pointer transition-colors border-l-3 border-l-transparent overflow-hidden hover:bg-background/75",
                selectedId === conversation.id &&
                  "bg-background border-l-primary",
              )}
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={avatarSrc} alt={name} />
                  <AvatarFallback>{name[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-lg text-foreground truncate">
                      {name}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatTime(conversation.lastMessageAt)}
                      </span>
                      {/* unread dot — পরে unread count দিয়ে control করা যাবে */}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1 capitalize">
                    {conversation.type.replace("_", " ")}
                  </p>
                  <p className="text-sm text-foreground truncate">
                    {conversation.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </ScrollArea>
    </div>
  );
}
