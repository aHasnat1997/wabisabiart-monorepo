// API এর wrapper response shape
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  meta: {
    timestamp: string;
    path: string;
    method: string;
  };
  data: T;
}

export interface Sender {
  id: string;
  fullName: string;
  avatarUrl: string;
  role: "customer" | "seller" | "admin";
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments: string[];
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  sender: Sender;
}

export interface ConversationCustomer {
  id: string;
  fullName: string;
  avatarUrl: string;
}

export interface ConversationSeller {
  id: string;
  shopName: string;
  shopLogo: string;
}

export interface Conversation {
  id: string;
  customerId: string;
  sellerId: string;
  orderId: string | null;
  type:
    | "general"
    | "order_inquiry"
    | "refund_request"
    | "product_inquiry"
    | "support";
  isArchived: boolean;
  lastMessage: string;
  lastMessageAt: string;
  createdAt: string;
  customer: ConversationCustomer;
  seller: ConversationSeller;
}

export interface SendMessagePayload {
  conversationId?: string;
  receiverId?: string;
  content: string;
  type?: Conversation["type"];
  orderId?: string;
  productId?: string;
  attachments?: string[];
}

// ✅ নতুন — unread count response এর জন্য
export interface UnreadCountResponse {
  count: number;
}
