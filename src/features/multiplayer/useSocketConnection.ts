import { useEffect, useMemo, useState } from "react";
import type { Socket } from "socket.io-client";
import { getSocket, getSocketConfig } from "../../services/socketClient";
import type { ConnectionStatus } from "../../../shared/session";

export function useSocketConnection(enabled = true) {
  const socketConfig = getSocketConfig();
  const socket = useMemo(() => (enabled ? getSocket() : null), [enabled]);
  const [status, setStatus] = useState<ConnectionStatus>(
    !enabled ? "disconnected" : !socketConfig.isConfigured ? "unconfigured" : socket?.connected ? "connected" : "connecting"
  );
  const [connectionError, setConnectionError] = useState("");

  useEffect(() => {
    if (!socket) {
      setStatus(enabled ? "unconfigured" : "disconnected");
      return undefined;
    }

    const handleConnect = () => {
      setConnectionError("");
      setStatus("connected");
    };
    const handleDisconnect = () => setStatus("disconnected");
    const handleReconnectAttempt = () => setStatus("reconnecting");
    const handleConnectError = (error: Error) => {
      setConnectionError(error.message);
      setStatus("error");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.io.on("reconnect_attempt", handleReconnectAttempt);

    if (!socket.connected) {
      setStatus("connecting");
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.io.off("reconnect_attempt", handleReconnectAttempt);
    };
  }, [enabled, socket]);

  return {
    socket: socket as Socket | null,
    socketConfigured: socketConfig.isConfigured,
    socketUrl: socketConfig.url,
    socketConfig,
    connectionError,
    status
  };
}
