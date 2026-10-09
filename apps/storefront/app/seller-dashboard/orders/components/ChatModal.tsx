"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/getInitials";
import { Mail, Send} from "lucide-react";
import { useState } from "react";


interface Message {
  id: number;
  text: string;
  sender: "user" | "admin";
  time: string;
}




const item = {
       id: 11,
    orderNumber: "#9781",
    customer: { name: "David Brown", email: "david.b@email.com", avatar: null },
    product: "Laptop Stand",
    date: "Oct 20, 2025",
    amount: "$45",
    status: "Pending Shipment",
}

const ChatModal = (
  // { item}: ChatModalProps
) => {

     const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I have a question about my order.",
      sender: "user",
      time: "10:30 AM",
    },
    {
      id: 2,
      text: "Hello! I'd be happy to help. What would you like to know?",
      sender: "admin",
      time: "10:32 AM",
    },
    {
      id: 3,
      text: "When will my order be shipped?",
      sender: "user",
      time: "10:35 AM",
    },
  ]);

    const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([
      ...messages,
      {
        id: Date.now(),
        text: input,
        sender: "admin",
        time: "12:19 AM",
      },
    ]);

    setInput("");
  };


  return (
    
  <div className="relative p-2 w-full">
  
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  {item.customer.avatar ? (
                    <AvatarImage src={item.customer.avatar} alt={item.customer.name} />
                  ) : (
                    <AvatarFallback className="bg-primary text-card uppercase">
                      {getInitials(item.customer.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col items-start gap-1">
                  <p className="font-medium">{item.customer.name}</p>
                  <div className="flex text-muted-foreground text-xs gap-1 items-center">
                    <Mail size={14} /> <span>{item.customer.email}</span>. Order <span>{item.orderNumber}</span>
                  </div>
                </div>
              </div>


        {/* CHAT BODY */}
        <div className="h-96 space-y-4 overflow-y-auto p-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "admin"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div className="max-w-[75%]">
                <div
                  className={`rounded-2xl px-4 py-2 text-sm ${
                    msg.sender === "admin"
                      ? "bg-primary text-card"
                      : "bg-muted-foreground/20"
                  }`}
                >
                  {msg.text}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div className="flex items-center gap-2 border-t p-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleSend}
            className="flex items-center gap-1 rounded-lg bg-primary/80 px-4 py-2 text-sm font-medium text-card hover:bg-primary"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
  </div>
     
  )
}

export default ChatModal;