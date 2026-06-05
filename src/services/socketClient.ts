import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  const url = getSocketUrl();

  if (!url) {
    return null;
  }

  if (!socket) {
    socket = io(url, {
      autoConnect: false,
      transports: ["websocket", "polling"]
    });
  }

  return socket;
}

export function getSocketUrl(): string {
  const configured = import.meta.env.VITE_SOCKET_URL as string | undefined;

  if (configured) {
    return configured;
  }

  return import.meta.env.DEV ? "http://localhost:3001" : "";
}
