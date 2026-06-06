import type { P2PConnectionState, P2PEventEnvelope } from "../p2pTypes";

export interface MultiplayerTransport {
  mode: "local" | "webrtc-host" | "webrtc-client";
  connect(): Promise<void>;
  disconnect(): void;
  send(event: P2PEventEnvelope): void;
  broadcast(event: P2PEventEnvelope): void;
  onEvent(callback: (event: P2PEventEnvelope) => void): () => void;
  getConnectionState(): P2PConnectionState;
}
