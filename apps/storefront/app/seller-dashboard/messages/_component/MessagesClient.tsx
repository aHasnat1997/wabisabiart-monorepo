"use client";

import { useState } from "react";
import { Conversation } from "@/types/chat";
import { MessageSidebar } from "./MessagesSideber";
import { ChatWindow } from "./Chatwindow";

interface MessagesClientProps {
  conversations: Conversation[];
  CURRENT_USER_ID: string | undefined;
}

export function MessagesClient({
  conversations,
  CURRENT_USER_ID,
}: MessagesClientProps) {
  const [selectedId, setSelectedId] = useState<string>(
    conversations[0]?.id ?? "",
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  if (!CURRENT_USER_ID)
    return (
      <div className="text-center text-muted-foreground">User not found</div>
    );

  return (
    <div className="">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Messages</h2>
        <span className="text-xs text-muted-foreground">
          Customer conversation
        </span>
      </div>

      <div className="flex max-h-full border rounded-lg overflow-hidden">
        {/* Sidebar */}
        <div
          className={`fixed inset-0 left-0 z-50 bg-background border-r flex flex-col transition-transform duration-300 md:relative md:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <MessageSidebar
            conversations={conversations}
            currentUserId={CURRENT_USER_ID}
            selectedId={selectedId}
            loading={false}
            setSelectedId={(id) => {
              setSelectedId(id as string);
              setSidebarOpen(false);
            }}
          />
        </div>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-10 bg-black/20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Chat */}
        <div className="flex-1 flex flex-col md:ml-0 ml-0 md:relative relative">
          {selectedConversation ? (
            <ChatWindow
              key={selectedConversation.id}
              setSidebarOpen={setSidebarOpen}
              sidebarOpen={sidebarOpen}
              conversation={selectedConversation}
              currentUserId={CURRENT_USER_ID}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
