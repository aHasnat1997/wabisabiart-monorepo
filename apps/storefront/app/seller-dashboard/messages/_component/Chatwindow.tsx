"use client";

import { Button } from "@/components/animate-ui/components/buttons/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, resolveImageUrl } from "@/lib/utils";
import { getInitials } from "@/lib/getInitials";
import {
  AlertTriangle,
  Check,
  Download,
  ListFilter,
  MessageCircleMore,
  Settings,
  X,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Conversation } from "@/types/chat";
import { useChat } from "@/hooks/useChat";
import { Message } from "@/types/chat";
import { ChatInput } from "@/components/Chatinput";
import Image from "next/image";

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ChatWindowProps {
  conversation: Conversation;
  currentUserId: string;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}


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
              isMine ? "bg-primary text-card" : "bg-card text-foreground",
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

export function ChatWindow({
  conversation,
  currentUserId,
  setSidebarOpen,
  sidebarOpen,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine other party's info
  const isCustomer = conversation.customerId === currentUserId;
  const otherName = isCustomer
    ? conversation.seller.shopName
    : conversation.customer.fullName;
  const otherAvatar = isCustomer
    ? `${resolveImageUrl(conversation.seller.shopLogo)}`
    : `${resolveImageUrl(conversation.customer.avatarUrl)}`;

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

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold overflow-hidden shrink-0">
            {otherAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={otherAvatar}
                alt={otherName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              getInitials(otherName)
            )}
          </div>

          <div>
            <h3 className="font-semibold text-foreground">{otherName}</h3>
            <p className="text-sm text-muted-foreground capitalize">
              {conversation.type.replace(/_/g, " ")}
              {conversation.orderId && ` • ${conversation.orderId}`}
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <ListFilter className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[60vh] md:h-[63vh]">
        {/* Refund Request Card */}
        {conversation.type === "refund_request" && (
          <div className="w-full bg-destructive/10 border-t md:border-l md:border-t-0 border-destructive p-4 sm:p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-destructive rounded-lg flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-card" />
              </div>
              <div>
                <h3 className="font-semibold text-destructive text-sm sm:text-base">
                  Refund Request
                </h3>
                <span className="text-xs text-destructive bg-chart-3 px-2 py-0.5 rounded inline-block mt-1">
                  Pending Review
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {conversation.orderId && (
                <>
                  <p className="text-xs text-destructive">Order ID</p>
                  <p className="font-semibold text-destructive text-sm">
                    {conversation.orderId}
                  </p>
                </>
              )}
              <p className="text-xs text-destructive">Last Message</p>
              <p className="text-sm text-destructive leading-relaxed">
                {conversation.lastMessage}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
              <Button className="py-3 bg-primary text-card rounded-lg hover:bg-primary/80 transition-colors font-medium flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                Approve Refund
              </Button>
              <Button className="py-3 bg-destructive text-card rounded-lg hover:bg-destructive/80 transition-colors font-medium flex items-center justify-center gap-2">
                <X className="w-4 h-4" />
                Deny Request
              </Button>
              <Button className="py-3 bg-muted-foreground text-card rounded-lg hover:bg-muted-foreground/80 transition-colors font-medium flex items-center justify-center gap-2">
                <MessageCircleMore className="w-4 h-4" />
                More Info
              </Button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/40">
          {/* Load more */}
          {hasMore && (
            <div className="text-center">
              <button
                onClick={loadMore}
                className="text-xs text-primary hover:underline"
              >
                Load older messages
              </button>
            </div>
          )}

          {/* Loading spinner */}
          {loading && (
            <div className="flex justify-center py-4">
              <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Empty state */}
          {!loading && messages.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">
              No messages yet. Start the conversation!
            </p>
          )}

          {/* Message bubbles */}
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              currentUserId={currentUserId}
            />
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-background border rounded-2xl px-4 py-2.5">
                <div className="flex gap-1 items-center h-4">
                  <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-background">
        <ChatInput
          onSend={(content, attachments) => {
            sendMessage({ content, attachments });
          }}
          onTyping={sendTyping}
        />
      </div>
    </div>
  );
}