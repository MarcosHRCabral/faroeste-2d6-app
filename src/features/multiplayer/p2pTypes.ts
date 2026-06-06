import type {
  OnlineCharacter,
  PublicSessionState,
  RollDicePayload,
  SessionPlayer
} from "../../../shared/session";

export type P2PConnectionState =
  | "idle"
  | "creating-offer"
  | "waiting-answer"
  | "creating-answer"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export type P2PMode = "menu" | "socket" | "p2p-host" | "p2p-client";

export type P2PEventType =
  | "transport_peer_connected"
  | "transport_connected"
  | "transport_disconnected"
  | "join_request"
  | "session_state"
  | "player_updated"
  | "player_left"
  | "character_create_request"
  | "character_update_request"
  | "character_delete_request"
  | "roll_request"
  | "roll_result"
  | "chat_message"
  | "sync_request"
  | "sync_response"
  | "permission_denied"
  | "host_error";

export interface P2PEventEnvelope<TPayload = unknown> {
  id: string;
  type: P2PEventType;
  senderId: string;
  createdAt: string;
  payload: TPayload;
}

export interface P2PPlayerMeta {
  playerId: string;
  playerName: string;
}

export interface HostOfferSignal {
  kind: "faroeste2d6-webrtc-offer";
  version: 1;
  pendingId: string;
  sessionId: string;
  sessionName: string;
  hostId: string;
  hostName: string;
  sdp: RTCSessionDescriptionInit;
}

export interface ClientAnswerSignal {
  kind: "faroeste2d6-webrtc-answer";
  version: 1;
  pendingId: string;
  sessionId: string;
  playerId: string;
  playerName: string;
  sdp: RTCSessionDescriptionInit;
}

export interface CharacterRequestPayload {
  character: OnlineCharacter;
}

export interface CharacterIdRequestPayload {
  characterId: string;
}

export interface PlayerUpdatedPayload {
  name: string;
}

export interface ChatRequestPayload {
  message: string;
}

export type RollRequestPayload = Omit<RollDicePayload, "code" | "playerId" | "token">;

export interface SessionStatePayload {
  session: PublicSessionState;
}

export interface PermissionDeniedPayload {
  message: string;
}

export interface PeerConnectedPayload {
  player: SessionPlayer;
}
