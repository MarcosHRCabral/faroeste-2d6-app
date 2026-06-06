import {
  createPeerConnection,
  decodeOfferSignal,
  encodeSignal,
  waitForIceGatheringComplete
} from "../webrtc/webrtcSignal";
import type {
  ClientAnswerSignal,
  HostOfferSignal,
  P2PConnectionState,
  P2PEventEnvelope,
  P2PPlayerMeta
} from "../p2pTypes";
import { makeP2PEvent, makeP2PId } from "../p2pSessionLogic";
import type { MultiplayerTransport } from "./MultiplayerTransport";

export class WebrtcClientTransport implements MultiplayerTransport {
  mode = "webrtc-client" as const;

  private callbacks = new Set<(event: P2PEventEnvelope) => void>();
  private channel: RTCDataChannel | null = null;
  private offer: HostOfferSignal | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private player: P2PPlayerMeta | null = null;
  private state: P2PConnectionState = "idle";

  async connect(): Promise<void> {
    this.state = this.channel?.readyState === "open" ? "connected" : "connecting";
  }

  async createAnswer(offerCode: string, playerName: string): Promise<{
    answerCode: string;
    offer: HostOfferSignal;
    player: P2PPlayerMeta;
  }> {
    this.state = "creating-answer";
    this.offer = decodeOfferSignal(offerCode);
    this.player = {
      playerId: makeP2PId("player"),
      playerName: playerName.trim() || "Jogador"
    };
    this.peerConnection = createPeerConnection();
    this.peerConnection.addEventListener("datachannel", (event) => {
      this.channel = event.channel;
      this.bindChannel(event.channel);
    });

    await this.peerConnection.setRemoteDescription(this.offer.sdp);
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    await waitForIceGatheringComplete(this.peerConnection);

    const signal: ClientAnswerSignal = {
      kind: "faroeste2d6-webrtc-answer",
      version: 1,
      pendingId: this.offer.pendingId,
      sessionId: this.offer.sessionId,
      playerId: this.player.playerId,
      playerName: this.player.playerName,
      sdp: this.peerConnection.localDescription?.toJSON() ?? answer
    };

    this.state = "connecting";
    return {
      answerCode: encodeSignal(signal),
      offer: this.offer,
      player: this.player
    };
  }

  disconnect(): void {
    this.channel?.close();
    this.peerConnection?.close();
    this.state = "disconnected";
  }

  send(event: P2PEventEnvelope): void {
    if (this.channel?.readyState === "open") {
      this.channel.send(JSON.stringify(event));
    }
  }

  broadcast(event: P2PEventEnvelope): void {
    this.send(event);
  }

  onEvent(callback: (event: P2PEventEnvelope) => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  getConnectionState(): P2PConnectionState {
    return this.state;
  }

  private bindChannel(channel: RTCDataChannel): void {
    channel.addEventListener("open", () => {
      this.state = "connected";
      this.emit(makeP2PEvent("transport_connected", "transport", { player: this.player }));
    });

    channel.addEventListener("message", (event) => {
      this.emit(parseEnvelope(event.data));
    });

    channel.addEventListener("close", () => {
      this.state = "disconnected";
      this.emit(makeP2PEvent("transport_disconnected", "transport", {}));
    });
  }

  private emit(event: P2PEventEnvelope): void {
    this.callbacks.forEach((callback) => callback(event));
  }
}

function parseEnvelope(data: unknown): P2PEventEnvelope {
  if (typeof data !== "string") {
    throw new Error("Mensagem P2P invalida.");
  }

  return JSON.parse(data) as P2PEventEnvelope;
}
