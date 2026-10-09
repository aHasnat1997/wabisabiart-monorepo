# Chat System Integration Guide (Next.js)

## Overview

The chat system provides:
- REST API for conversations, messages, and unread counts
- WebSocket (`/chat` namespace) for real-time messaging, typing indicators, and read receipts

**Base URL:** `https://your-api.com`  
**WebSocket namespace:** `/chat`

---

## Authentication

Auth is **cookie-based**. The server sets an `httpOnly` cookie named after the `ACCESS_TOKEN_COOKIE_NAME` env var (e.g. `access_token`) on login. The cookie is:

```
httpOnly: true
secure: true
sameSite: none
path: /
```

You never manually handle the cookie — the browser sends it automatically on every request **as long as you use `credentials: 'include'`** (REST) or `withCredentials: true` (WebSocket).

The server also supports auto-renewal: if the token expires but `stayLoggedIn` was set at login, the server silently renews it and sets a new cookie via the `X-Access-Token` response header.

---

## 1. Next.js Setup

In `next.config.js` (or `next.config.ts`) add a rewrites proxy so cookies are sent same-origin:

```js
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://your-api.com/:path*',
      },
    ];
  },
};
```

> If you don't use a proxy, set `sameSite: none` and `secure: true` on the server cookie (already done) and always use `credentials: 'include'`.

---

## 2. Login (sets the cookie)

```ts
const res = await fetch('https://your-api.com/auth/login', {
  method: 'POST',
  credentials: 'include',          // ← required so browser stores the cookie
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, stayLoggedIn: false }),
});
```

After this call the browser holds the `access_token` cookie automatically. No token storage needed.

---

## 3. REST API

Add `credentials: 'include'` to every fetch — that's all.

### Get Conversations

```
GET /chat/conversations?type=general
```

```ts
const res = await fetch('https://your-api.com/chat/conversations', {
  credentials: 'include',
});
```

Optional `type` filter: `general` | `order_inquiry` | `refund_request` | `product_inquiry` | `support`

**Response:**
```json
[
  {
    "id": "uuid",
    "type": "general",
    "lastMessage": "Hello!",
    "lastMessageAt": "2024-01-01T00:00:00.000Z",
    "customer": { "id": "uuid", "fullName": "John", "avatarUrl": "..." },
    "seller": { "id": "uuid", "shopName": "My Shop", "shopLogo": "..." }
  }
]
```

### Get Messages (Paginated)

```
GET /chat/conversations/:id/messages?page=1&limit=30
```

```ts
const res = await fetch(`https://your-api.com/chat/conversations/${id}/messages?page=1`, {
  credentials: 'include',
});
```

Returns messages in chronological order. Default: page `1`, limit `30`.

**Response:**
```json
[
  {
    "id": "uuid",
    "content": "Hello!",
    "attachments": [],
    "isRead": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "sender": { "id": "uuid", "fullName": "John", "avatarUrl": "...", "role": "customer" }
  }
]
```

### Mark Conversation as Read

```
POST /chat/conversations/:id/read
```

```ts
await fetch(`https://your-api.com/chat/conversations/${id}/read`, {
  method: 'POST',
  credentials: 'include',
});
```

### Get Unread Count

```
GET /chat/unread-count
```

```ts
const res = await fetch('https://your-api.com/chat/unread-count', {
  credentials: 'include',
});
// { "count": 5 }
```

---

## 4. WebSocket Connection

Install the client:

```bash
npm install socket.io-client
```

Connect with `withCredentials: true` — the browser will attach the cookie automatically via the handshake headers:

```ts
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('https://your-api.com/chat', {
  withCredentials: true,   // ← sends the cookie in the WS handshake
});
```

> No `auth.token` needed. The server reads the cookie directly from `client.handshake.headers.cookie`.

---

## 5. WebSocket Events

### Emit (client → server)

#### `joinConversation`
Join a room to receive real-time messages for a conversation.
```ts
socket.emit('joinConversation', { conversationId: 'uuid' });
```

#### `leaveConversation`
```ts
socket.emit('leaveConversation', { conversationId: 'uuid' });
```

#### `sendMessage`
Creates a new conversation automatically if `conversationId` is omitted.

| Field | Type | Required | Notes |
|---|---|---|---|
| `conversationId` | `string (uuid)` | No | Omit to start a new conversation |
| `receiverId` | `string (uuid)` | Conditional | Seller's `sellerProfile.id` — required when starting a new non-support conversation |
| `content` | `string` | Yes | Min 1 character |
| `type` | `string` | No | `general` (default), `order_inquiry`, `refund_request`, `product_inquiry`, `support` |
| `orderId` | `string (uuid)` | No | Link to an order |
| `productId` | `string (uuid)` | No | Link to a product |
| `attachments` | `string[]` | No | Array of file URLs |

```ts
// Start a new conversation with a seller
socket.emit('sendMessage', {
  receiverId: 'seller-profile-uuid',
  content: 'Is this still available?',
  type: 'product_inquiry',
  productId: 'product-uuid',
  attachments: [],
});

// Reply in an existing conversation
socket.emit('sendMessage', {
  conversationId: 'conversation-uuid',
  content: 'Yes it is!',
});

// Contact support
socket.emit('sendMessage', {
  content: 'I need help with my order',
  type: 'support',
  orderId: 'order-uuid',
});
```

#### `markAsRead`
```ts
socket.emit('markAsRead', { conversationId: 'uuid' });
```

#### `typing`
```ts
socket.emit('typing', { conversationId: 'uuid', isTyping: true });
```

---

### Listen (server → client)

#### `newMessage`
Fired to everyone in the room when a message is sent.
```ts
socket.on('newMessage', (message) => {
  // same shape as REST messages response
});
```

#### `messagesRead`
```ts
socket.on('messagesRead', ({ conversationId, readBy }) => {
  // update read receipts in UI
});
```

#### `userTyping`
```ts
socket.on('userTyping', ({ userId, isTyping }) => {
  // show/hide typing indicator
});
```

---

## 6. Full Example (React Hook)

```tsx
// hooks/useChat.ts
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useChat(conversationId: string) {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    socketRef.current = io('https://your-api.com/chat', {
      withCredentials: true,  // cookie is sent automatically
    });

    const socket = socketRef.current;
    socket.emit('joinConversation', { conversationId });

    socket.on('newMessage', (msg) => setMessages((prev) => [...prev, msg]));
    socket.on('userTyping', ({ isTyping }) => setIsTyping(isTyping));

    return () => {
      socket.emit('leaveConversation', { conversationId });
      socket.disconnect();
    };
  }, [conversationId]);

  const sendMessage = (content: string, attachments: string[] = []) => {
    socketRef.current?.emit('sendMessage', { conversationId, content, attachments });
  };

  const sendTyping = (typing: boolean) => {
    socketRef.current?.emit('typing', { conversationId, isTyping: typing });
  };

  return { messages, isTyping, sendMessage, sendTyping };
}
```

---

## 7. Conversation Types & Roles

| Type | Who can create | Notes |
|---|---|---|
| `general` | customer or seller | Requires `receiverId` (seller profile id) |
| `order_inquiry` | customer or seller | Pass `orderId` |
| `refund_request` | customer | Pass `orderId` |
| `product_inquiry` | customer | Pass `productId` |
| `support` | customer | No `receiverId` needed; admins can read these |

**Role behavior:**
- `customer` — sees their own conversations
- `seller` — sees conversations tied to their `sellerProfile.id`
- `admin` — sees only `support` conversations

---

## 8. Load Older Messages (Infinite Scroll)

```ts
const loadMore = async (page: number) => {
  const res = await fetch(
    `https://your-api.com/chat/conversations/${id}/messages?page=${page}&limit=30`,
    { credentials: 'include' },
  );
  const older = await res.json();
  setMessages((prev) => [...older, ...prev]);
};
```

---

## 9. Logout

```ts
await fetch('https://your-api.com/auth/logout', {
  method: 'POST',
  credentials: 'include',
});
// server clears the cookie — socket will be rejected on next reconnect
socket.disconnect();
```
