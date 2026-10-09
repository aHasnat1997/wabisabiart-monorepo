"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Search, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn, resolveImageUrl } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/getInitials";
import { Conversation } from "@/types/chat";

// const TYPE_TO_TAB: Record<Conversation["type"], string> = {
//   general: "all",
//   order_inquiry: "orders",
//   refund_request: "request",
//   product_inquiry: "inquiries",
//   support: "all",
// };

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

type MessageSidebarProps = {
  conversations: Conversation[];
  currentUserId: string;
  selectedId: string;
  setSelectedId: Dispatch<SetStateAction<string>>;
  loading?: boolean;
};

export function MessageSidebar({
  conversations,
  currentUserId,
  selectedId,
  setSelectedId,
  loading = false,
}: MessageSidebarProps) {
  // const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // const refundCount = conversations.filter(
  //   (c) => c.type === "refund_request",
  // ).length;

  // const filtered = conversations
  //   .filter((conv) =>
  //     activeTab === "All"
  //       ? true
  //       : TYPE_TO_TAB[conv.type] === activeTab.toLowerCase(),
  //   )
  //   .filter((conv) => {
  //     const term = searchTerm.trim().toLowerCase();
  //     if (!term) return true;

  //     const isCustomer = conv.customerId === currentUserId;
  //     const name = isCustomer ? conv.seller.shopName : conv.customer.fullName;

  //     return (
  //       name.toLowerCase().includes(term) ||
  //       conv.lastMessage.toLowerCase().includes(term) ||
  //       conv.type.toLowerCase().includes(term)
  //     );
  //   });

  return (
    <aside className="w-full sm:w-80 lg:w-95 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        {/* Tabs */}
        {/* <div className="flex gap-2 mb-4 bg-muted-foreground/20 p-1 rounded-lg relative">
          {["All", "Request", "Orders", "Inquiries"].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Button
                key={tab}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "relative flex items-center gap-1 bg-muted-foreground/10 py-1.5 rounded-md",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/80 rounded-md -z-10"
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 28,
                    }}
                  />
                )}
                {tab === "Request" && (
                  <AlertTriangle className="w-3 h-3 opacity-80 relative z-10" />
                )}
                <span className="relative z-10">{tab}</span>
                {tab === "Request" && refundCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-1 px-1.5 text-xs relative z-10"
                  >
                    {refundCount}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div> */}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search messages"
            className="pl-9"
          />
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="h-[80vh] md:h-[63vh]">
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* {!loading && filtered.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">
              No conversations found
            </p>
          )} */}

          <AnimatePresence mode="wait">
            {conversations.map((conv) => {
              const isCustomer = conv.customerId === currentUserId;
              const name = isCustomer
                ? conv.seller.shopName
                : conv.customer.fullName;
              const avatarSrc = isCustomer
                ? `${resolveImageUrl(conv.seller.shopLogo)}`
                : `${resolveImageUrl(conv.customer.avatarUrl)}`;
              const isRefund = conv.type === "refund_request";
              const isOrder = conv.type === "order_inquiry" && conv.orderId;
              const isInquiry = conv.type === "product_inquiry";

              return (
                <motion.button
                  key={conv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setSelectedId(conv.id)}
                  className={cn(
                    "w-full text-left p-4 border-b cursor-pointer transition-colors border-l-4 flex gap-3 items-start",
                    selectedId === conv.id
                      ? "bg-primary/10 border-l-primary shadow-sm"
                      : "hover:bg-muted border-l-transparent",
                  )}
                >
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={avatarSrc} alt={name} />
                      <AvatarFallback className="bg-primary/90 text-card">
                        {getInitials(name)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-sm font-semibold text-foreground">
                          {name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conv.lastMessageAt)}
                          </span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex gap-2 flex-wrap mb-1">
                        {isRefund && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Refund Request
                          </Badge>
                        )}
                        {isOrder && conv.orderId && (
                          <Badge variant="secondary">{conv.orderId}</Badge>
                        )}
                        {isInquiry && (
                          <Badge variant="outline">Product Inquiry</Badge>
                        )}
                        {conv.type === "general" && (
                          <Badge variant="outline">General</Badge>
                        )}
                        {conv.type === "support" && (
                          <Badge variant="secondary">Support</Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </aside>
  );
}
