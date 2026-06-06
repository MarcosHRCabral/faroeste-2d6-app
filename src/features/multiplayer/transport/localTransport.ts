import type { P2PEventEnvelope } from "../p2pTypes";
import type { MultiplayerTransport } from "./MultiplayerTransport";

export class LocalTransport implements MultiplayerTransport {
  mode = "local" as const;

  async connect(): Promise<void> {
    return Promise.resolve();
  }

  disconnect(): void {
    return undefined;
  }

  send(_event: P2PEventEnvelope): void {
    return undefined;
  }

  broadcast(_event: P2PEventEnvelope): void {
    return undefined;
  }

  onEvent(_callback: (event: P2PEventEnvelope) => void): () => void {
    return () => undefined;
  }

  getConnectionState() {
    return "idle" as const;
  }
}
