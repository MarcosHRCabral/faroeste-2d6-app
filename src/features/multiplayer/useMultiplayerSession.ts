import { useMemo, useState } from "react";
import { getSocketConfig } from "../../services/socketClient";
import type { P2PMode } from "./p2pTypes";
import { useP2PMultiplayerSession } from "./useP2PMultiplayerSession";
import { useSocketMultiplayerSession } from "./useSocketMultiplayerSession";

export function useMultiplayerSession(initialCode = "") {
  const socketConfig = getSocketConfig();
  const [activeMode, setActiveMode] = useState<P2PMode>(() =>
    initialCode && socketConfig.isConfigured ? "socket" : "menu"
  );
  const p2p = useP2PMultiplayerSession();
  const socket = useSocketMultiplayerSession(initialCode, activeMode === "socket");
  const active = activeMode === "socket" ? socket : p2p;

  return useMemo(
    () => ({
      ...active,
      mode: activeMode,
      socketConfigured: socket.socketConfigured,
      socketUrl: socket.socketUrl,
      socketConfig: socket.socketConfig,
      startMenu: () => setActiveMode("menu"),
      startSocketMode: () => setActiveMode("socket"),
      startP2PHost: (playerName: string, sessionName: string) => {
        setActiveMode("p2p-host");
        p2p.startP2PHost(playerName, sessionName);
      },
      startP2PJoin: (playerName: string, offerCode: string) => {
        setActiveMode("p2p-client");
        void p2p.startP2PJoin(playerName, offerCode);
      },
      createP2POffer: p2p.createP2POffer,
      acceptP2PAnswer: p2p.acceptP2PAnswer,
      saveSnapshot: p2p.saveSnapshot,
      exportSessionJson: p2p.exportSessionJson,
      importSessionJson: p2p.importSessionJson,
      p2p
    }),
    [active, activeMode, p2p, socket.socketConfig, socket.socketConfigured, socket.socketUrl]
  );
}
