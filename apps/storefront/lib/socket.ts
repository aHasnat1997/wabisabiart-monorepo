import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentToken: string | undefined;

export function getSocket(token?: string): Socket {
  // token change হলে reconnect করো
  if (socket && token && currentToken !== token) {
    console.log("[socket] Token changed — reconnecting");
    socket.disconnect();
    socket = null;
    currentToken = undefined;
  }

  if (!socket) {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (!url)
      throw new Error("[socket] NEXT_PUBLIC_SOCKET_URL is not defined!");

    console.log("[socket] Creating socket:", `${url}/chat`);
    currentToken = token;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket = io(`${url}/chat`, {
      withCredentials: true,
      autoConnect: false,
      transports: ["websocket", "polling"],
      ...(token && { auth: { token } }), // ✅ token থাকলেই auth set করো
    } as Parameters<typeof io>[1]);

    socket.on("connect", () =>
      console.log("[socket] ✅ Connected! ID:", socket?.id),
    );
    socket.on("connect_error", (err) =>
      console.error("[socket] ❌ Error:", err.message),
    );
    socket.on("disconnect", (reason) =>
      console.warn("[socket] ⚠️ Disconnected:", reason),
    );
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = undefined;
  }
}