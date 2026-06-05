import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;
let socketUrl = "";

export interface SocketClientConfig {
  isConfigured: boolean;
  isDevelopment: boolean;
  missingMessage: string;
  url: string;
}

const missingSocketMessage =
  "Backend multiplayer nao configurado. Crie um arquivo .env.local com VITE_SOCKET_URL=http://localhost:3001 e reinicie o Vite.";

export function getSocket(): Socket | null {
  const { isConfigured, url } = getSocketConfig();

  if (!isConfigured) {
    return null;
  }

  if (!socket || socketUrl !== url) {
    socket?.disconnect();
    socketUrl = url;
    socket = io(url, {
      autoConnect: false,
      transports: ["websocket", "polling"]
    });
  }

  return socket;
}

export function getSocketUrl(): string {
  return getSocketConfig().url;
}

export function getSocketConfig(): SocketClientConfig {
  const url = ((import.meta.env.VITE_SOCKET_URL as string | undefined) ?? "").trim();

  return {
    isConfigured: Boolean(url),
    isDevelopment: Boolean(import.meta.env.DEV),
    missingMessage: missingSocketMessage,
    url
  };
}
