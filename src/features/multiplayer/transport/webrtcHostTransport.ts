import {
  createPeerConnection,
  decodeAnswerSignal,
  encodeSignal,
  waitForIceGatheringComplete,
  WEBRTC_CHANNEL_NAME
} from "../webrtc/webrtcSignal";
import type {
  ClientAnswerSignal,
  HostOfferSignal,
  P2PConnectionState,
  P2PEventEnvelope,
  P2PPlayerMeta
} from "../p2pTypes";
import { makeP2PId, makeP2PEvent } from "../p2pSessionLogic";
import type { MultiplayerTransport } from "./MultiplayerTransport";

interface HostInfo {
  sessionId: string;
  sessionName: string;
  hostId: string;
  hostName: string;
}

interface PendingPeer {
  channel: RTCDataChannel;
  peerConnection: RTCPeerConnection;
  player?: P2PPlayerMeta;
}

interface ConnectedPeer extends P2PPlayerMeta {
  channel: RTCDataChannel;
  peerConnection: RTCPeerConnection;
}

export class WebrtcHostTransport implements MultiplayerTransport {
  mode = "webrtc-host" as const;

  private callbacks = new Set<(event: P2PEventEnvelope) => void>();
  private pending = new Map<string, PendingPeer>();
  private peers = new Map<string, ConnectedPeer>();
  private state: P2PConnectionState = "idle";

  async connect(): Promise<void> {
    this.state = "connected";
  }

  async createOffer(hostInfo: HostInfo): Promise<{ offerCode: string; pendingId: string }> {
    this.state = "creating-offer";
    const pendingId = makeP2PId("pending");
    const peerConnection = createPeerConnection();
    const channel = peerConnection.createDataChannel(WEBRTC_CHANNEL_NAME);
    const pendingPeer: PendingPeer = { channel, peerConnection };

    this.pending.set(pendingId, pendingPeer);
    this.bindChannel(channel, () => pendingPeer.player);

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    await waitForIceGatheringComplete(peerConnection);

    const signal: HostOfferSignal = {
      kind: "faroeste2d6-webrtc-offer",
      version: 1,
      pendingId,
      sessionId: hostInfo.sessionId,
      sessionName: hostInfo.sessionName,
      hostId: hostInfo.hostId,
      hostName: hostInfo.hostName,
      sdp: peerConnection.localDescription?.toJSON() ?? offer
    };

    this.state = "waiting-answer";
    return {
      offerCode: encodeSignal(signal),
      pendingId
    };
  }

  async acceptAnswer(answerCode: string): Promise<P2PPlayerMeta> {
    const answer = decodeAnswerSignal(answerCode);
    const pendingPeer = this.pending.get(answer.pendingId);

    if (!pendingPeer) {
      throw new Error("Este Answer Code nao corresponde a nenhum convite aberto.");
    }

    pendingPeer.player = {
      playerId: answer.playerId,
      playerName: answer.playerName
    };
    await pendingPeer.peerConnection.setRemoteDescription(answer.sdp);
    this.state = "connecting";
    return pendingPeer.player;
  }

  disconnect(): void {
    [...this.pending.values(), ...this.peers.values()].forEach(({ channel, peerConnection }) => {
      channel.close();
      peerConnection.close();
    });
    this.pending.clear();
    this.peers.clear();
    this.state = "disconnected";
  }

  send(event: P2PEventEnvelope): void {
    this.broadcast(event);
  }

  sendTo(playerId: string, event: P2PEventEnvelope): void {
    const peer = this.peers.get(playerId);

    if (peer?.channel.readyState === "open") {
      peer.channel.send(JSON.stringify(event));
    }
  }

  broadcast(event: P2PEventEnvelope): void {
    this.peers.forEach((peer) => {
      if (peer.channel.readyState === "open") {
        peer.channel.send(JSON.stringify(event));
      }
    });
  }

  onEvent(callback: (event: P2PEventEnvelope) => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  getConnectionState(): P2PConnectionState {
    return this.state;
  }

  closePeer(playerId: string): void {
    const peer = this.peers.get(playerId);

    if (peer) {
      peer.channel.close();
      peer.peerConnection.close();
      this.peers.delete(playerId);
    }
  }

  private bindChannel(channel: RTCDataChannel, getPlayer: () => P2PPlayerMeta | undefined): void {
    channel.addEventListener("open", () => {
      const player = getPlayer();

      if (!player) {
        return;
      }

      const pendingPeer = [...this.pending.entries()].find(([, value]) => value.channel === channel);

      if (pendingPeer) {
        this.pending.delete(pendingPeer[0]);
        this.peers.set(player.playerId, {
          ...player,
          channel,
          peerConnection: pendingPeer[1].peerConnection
        });
      }

      this.state = "connected";
      this.emit(
        makeP2PEvent("transport_peer_connected", "transport", {
          player
        })
      );
    });

    channel.addEventListener("message", (event) => {
      this.emit(parseEnvelope(event.data));
    });

    channel.addEventListener("close", () => {
      const player = getPlayer();

      if (player) {
        this.peers.delete(player.playerId);
        this.emit(makeP2PEvent("transport_disconnected", "transport", { playerId: player.playerId }));
      }
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
