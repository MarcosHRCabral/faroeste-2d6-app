import { useEffect, useMemo, useState } from "react";
import type { Socket } from "socket.io-client";
import { getSocket, getSocketUrl } from "../../services/socketClient";
import type { ConnectionStatus } from "../../../shared/session";

export function useSocketConnection() {
  const socket = useMemo(() => getSocket(), []);
  const [status, setStatus] = useState<ConnectionStatus>(socket?.connected ? "connected" : "disconnected");
  const socketUrl = getSocketUrl();

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const handleConnect = () => setStatus("connected");
    const handleDisconnect = () => setStatus("disconnected");
    const handleReconnectAttempt = () => setStatus("reconnecting");

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.io.on("reconnect_attempt", handleReconnectAttempt);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.io.off("reconnect_attempt", handleReconnectAttempt);
    };
  }, [socket]);

  return {
    socket: socket as Socket | null,
    socketUrl,
    status
  };
}
