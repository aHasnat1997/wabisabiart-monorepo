"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListFilter, Download } from "lucide-react";
import {
  Menu,
  MenuArrow,
  MenuPopup,
  MenuPortal,
  MenuPositioner,
  MenuTrigger,
} from "@/components/animate-ui/primitives/base/menu";
import { cn, resolveImageUrl } from "@/lib/utils";
import { Conversation, Message } from "@/types/chat";
import { useChat } from "@/hooks/useChat";
import { ConversationSidebar } from "./Conversationsidebar";
import { ChatInput } from "@/components/Chatinput";
import Image from "next/image";

interface Props {
  conversation: Conversation;
  currentUserId: string;
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Attachment renderer ───────────────────────────────────────────────────────
function MessageAttachments({
  attachments,
  isMine,
}: {
  attachments: string[];
  isMine: boolean;
}) {
  if (!attachments?.length) return null;

  const isImage = (url: string) =>
    /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(url);

  return (
    <div
      className={cn(
        "flex flex-wrap gap-1.5 mt-1",
        isMine ? "justify-end" : "justify-start",
      )}
    >
      {attachments.map((url, idx) => {
        const src = resolveImageUrl(url);
        const img = isImage(url);

        return img ? (
          // ── Image attachment ──
          <a
            key={idx}
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg overflow-hidden border border-white/20 hover:opacity-90 transition-opacity"
          >
            <div className="relative w-16 h-16 sm:w-24 sm:h-24">
              <Image
                src={src}
                alt={`attachment ${idx + 1}`}
                fill
                className="object-cover"
                sizes="192px"
                unoptimized
              />
            </div>
          </a>
        ) : (
          // ── File attachment ──
          <a
            key={idx}
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            download
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors hover:opacity-80",
              isMine
                ? "bg-primary-foreground/20 border-primary-foreground/30 text-primary-foreground"
                : "bg-background border-border text-foreground",
            )}
          >
            <Download className="size-3.5 shrink-0" />
            <span className="truncate max-w-35">
              {url.split("/").pop() ?? "file"}
            </span>
          </a>
        );
      })}
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────
function MessageBubble({
  message,
  currentUserId,
}: {
  message: Message;
  currentUserId: string;
}) {
  const isMine = message.senderId === currentUserId;
  const hasText = message.content?.trim().length > 0;
  const hasAttachments = message.attachments?.length > 0;

  return (
    <div className={cn("flex m-2", isMine ? "justify-end" : "justify-start")}>
      {!isMine && (
        <Avatar className="h-8 w-8 shrink-0 mr-2 mt-1">
          <AvatarImage
            src={resolveImageUrl(message.sender.avatarUrl)}
            alt={message.sender.fullName}
          />
          <AvatarFallback>{message.sender.fullName[0]}</AvatarFallback>
        </Avatar>
      )}

      <div className={cn("max-w-[70%]", isMine ? "items-end" : "items-start")}>
        {/* Attachments — above text bubble */}
        {hasAttachments && (
          <MessageAttachments
            attachments={message.attachments}
            isMine={isMine}
          />
        )}

        {/* Text bubble — only if has text */}
        {hasText && (
          <div
            className={cn(
              "rounded-lg px-3 md:px-4 py-1.5 md:py-2 mt-1",
              isMine ? "bg-primary text-card" : "bg-muted text-foreground",
            )}
          >
            <p className="text-sm md:text-base">{message.content}</p>
            <span
              className={cn(
                "text-[10px] md:text-xs mt-1 flex items-center justify-end gap-1",
                isMine ? "text-primary-foreground" : "text-muted-foreground",
              )}
            >
              {formatTime(message.createdAt)}
              {isMine && <span>{message.isRead ? "✓✓" : "✓"}</span>}
            </span>
          </div>
        )}

        {/* Time — when only attachments, no text */}
        {!hasText && hasAttachments && (
          <span
            className={cn(
              "text-[10px] mt-0.5 flex items-center gap-1 px-1",
              isMine
                ? "justify-end text-muted-foreground"
                : "text-muted-foreground",
            )}
          >
            {formatTime(message.createdAt)}
            {isMine && <span>{message.isRead ? "✓✓" : "✓"}</span>}
          </span>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex m-2 justify-start">
      <div className="bg-muted rounded-lg px-4 py-2">
        <div className="flex gap-1 items-center h-4">
          <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

// ── ChatPanel ─────────────────────────────────────────────────────────────────
export function ChatPanel({
  conversation,
  currentUserId,
  conversations,
  onSelectConversation,
}: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isCustomer = conversation.customerId === currentUserId;
  const otherName = isCustomer
    ? conversation.seller.shopName
    : conversation.customer.fullName;
  const otherAvatar = isCustomer
    ? resolveImageUrl(conversation.seller.shopLogo)
    : resolveImageUrl(conversation.customer.avatarUrl);

  const currentUser: Message["sender"] = isCustomer
    ? {
        id: currentUserId,
        fullName: conversation.customer.fullName,
        avatarUrl: conversation.customer.avatarUrl,
        role: "customer",
      }
    : {
        id: currentUserId,
        fullName: conversation.seller.shopName,
        avatarUrl: conversation.seller.shopLogo,
        role: "seller",
      };

  const {
    messages,
    isTyping,
    loading,
    hasMore,
    sendMessage,
    sendTyping,
    loadMore,
  } = useChat(conversation.id, currentUserId, currentUser);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={otherAvatar} alt={otherName} />
            <AvatarFallback>{otherName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg text-foreground truncate">
              {otherName}
            </h3>
            <div className="flex flex-col md:flex-row items-start md:items-center md:gap-2 text-xs md:text-sm text-muted-foreground">
              <span className="capitalize">
                {conversation.type.replace("_", " ")}
              </span>
              {conversation.orderId && (
                <>
                  <span className="hidden md:block">•</span>
                  <span>{conversation.orderId}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <Menu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <MenuTrigger className="block lg:hidden">
            <div className="bg-card p-2 rounded-lg cursor-pointer border border-transparent hover:border-primary">
              <ListFilter size={20} />
            </div>
          </MenuTrigger>
          <MenuPortal>
            <MenuPositioner side="bottom" align="end" className="z-50">
              <MenuPopup className="w-full shadow-2xl rounded-md border-primary h-[50vh] overflow-x-hidden border bg-card px-2 py-4 outline-none">
                <MenuArrow />
                <ConversationSidebar
                  conversations={conversations}
                  selectedId={conversation.id}
                  currentUserId={currentUserId}
                  onSelect={(c) => {
                    onSelectConversation(c);
                    setIsMenuOpen(false);
                  }}
                />
              </MenuPopup>
            </MenuPositioner>
          </MenuPortal>
        </Menu>
      </div>

      {/* Messages */}
      <div className="flex-1">
        <ScrollArea className="h-[calc(100vh-28rem)]">
          {hasMore && (
            <div className="text-center py-2">
              <button
                onClick={loadMore}
                className="text-xs text-primary hover:underline"
              >
                Load older messages
              </button>
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-4">
              <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && messages.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">
              No messages yet. Start the conversation!
            </p>
          )}

          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              currentUserId={currentUserId}
            />
          ))}

          {isTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-background">
        <ChatInput
          onSend={(content, attachments) => {
            sendMessage({ content, attachments });
          }}
          onTyping={sendTyping}
        />
      </div>
    </>
  );
}