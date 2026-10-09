"use client";

import { useState } from "react";
import {
  Search,
  Trash2,
  Flag,
  Archive,
  BookmarkCheck,
  BookmarkX,
} from "lucide-react";
import { Checkbox } from "@/components/animate-ui/components/base/checkbox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Conversation } from "@/types/chat";
import { ConversationSidebar } from "./Conversationsidebar";
import { ChatPanel } from "./Chatpanel";

// const sidebarItems = [
//   { label: "Inbox", value: "inbox" },
//   { label: "From Etsy", value: "from-etsy" },
//   { label: "Sent", value: "sent" },
//   { label: "All", value: "all" },
//   { label: "Unread", value: "unread" },
//   { label: "Spam", value: "spam" },
// ];

interface InboxClientProps {
  conversations: Conversation[];
  CURRENT_USER_ID: string;
}

export function InboxClient({
  conversations,
  CURRENT_USER_ID,
}: InboxClientProps) {
  // const [selectedFolder, setSelectedFolder] = useState("inbox");
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(conversations[0] ?? null);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start gap-2 md:items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-foreground">Messages</h2>
        <InputGroup className="h-10 w-full md:w-sm bg-background border-none">
          <InputGroupInput placeholder="Search messages..." />
          <InputGroupAddon>
            <Search className="h-4 w-4 text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
      </div>

      {/* Main Content */}
      <div className="flex flex-col xl:flex-row flex-1 gap-2 xl:gap-0 rounded-lg">
        {/* Sidebar Nav */}
        <nav className="flex flex-row xl:flex-col responsive-tabs overflow-x-auto gap-1 pb-2 pb:pb-0">
          {/* {sidebarItems.map((item) => (
            <button
              key={item.value}
              onClick={() => setSelectedFolder(item.value)}
              className={cn(
                "w-full text-left text-sm lg:text-lg text-nowrap cursor-pointer px-3 py-2 border-l-2 font-medium rounded-l-md transition-colors",
                selectedFolder === item.value
                  ? "bg-linear-to-r from-primary/15 to-primary/1 border-primary text-primary"
                  : "text-foreground hover:bg-background border-transparent",
              )}
            >
              {item.label}
            </button>
          ))} */}
        </nav>

        {/* Conversation List + Chat Area */}
        <div className="flex flex-1 flex-col border rounded-md">
          {/* Action Bar */}
          <div className="flex items-center responsive-tabs overflow-x-auto gap-2 p-3">
            <Checkbox id="select-all" />
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-transparent hover:text-destructive"
            >
              <Trash2 />
              Trash
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-transparent hover:text-chart-8"
            >
              <BookmarkX /> Mark as Unread
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-transparent hover:text-primary"
            >
              <BookmarkCheck /> Mark as Read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-transparent hover:text-chart-6"
            >
              <Flag />
              Report
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-transparent hover:text-chart-4"
            >
              <Archive />
              Archive
            </Button>
          </div>

          <div className="flex flex-1  border-t overflow-hidden">
            {/* Desktop: Conversation List */}
            <div className="w-96 hidden lg:block border-r">
              <ConversationSidebar
                conversations={conversations}
                selectedId={selectedConversation?.id ?? ""}
                currentUserId={CURRENT_USER_ID}
                onSelect={setSelectedConversation}
              />
            </div>

            {/* Chat Panel */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <ChatPanel
                  key={selectedConversation.id}
                  conversation={selectedConversation}
                  currentUserId={CURRENT_USER_ID}
                  conversations={conversations}
                  onSelectConversation={setSelectedConversation}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-muted-foreground text-center px-6">
                    Select a conversation to view messages
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
