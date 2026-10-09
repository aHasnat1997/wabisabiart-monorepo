export type ConversationMessage = {
  sender: "user" | "customer";
  message: string;
  time: string;
};

export type ConversationListItem = {
  id: string;
  preview: string;
  orderId: string;
  lastMessageTime: string;
  isReadCount: number;
  user: {
    name: string;
    email: string;
    avatar: string;
  };
};

export type ConversationDetail = {
  id: string;
  messages: ConversationMessage[];
};
