import type {
  ChatMessage,
  OnlineCharacter,
  PublicSessionState,
  RollDifficulty,
  SessionPlayer,
  SessionRoll,
  SessionSettings
} from "../../../shared/session";
import { defaultSessionSettings } from "../../../shared/session";
import type {
  ChatRequestPayload,
  P2PEventEnvelope,
  P2PEventType,
  PlayerUpdatedPayload,
  RollRequestPayload
} from "./p2pTypes";

const MAX_ROLLS = 50;
const MAX_CHAT = 100;

export function makeP2PId(prefix = "p2p"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function makeP2PEvent<TPayload>(
  type: P2PEventType,
  senderId: string,
  payload: TPayload
): P2PEventEnvelope<TPayload> {
  return {
    id: makeP2PId("evt"),
    type,
    senderId,
    createdAt: new Date().toISOString(),
    payload
  };
}

export function createP2PPlayer(name: string, role: "gm" | "player", id = makeP2PId("player")): SessionPlayer {
  const now = new Date().toISOString();

  return {
    id,
    name: sanitizeText(name, role === "gm" ? "Mestre" : "Jogador", 40),
    role,
    connected: true,
    joinedAt: now,
    lastSeenAt: now,
    characterIds: []
  };
}

export function createP2PSession(hostName: string, sessionName = ""): {
  credentials: {
    code: string;
    playerId: string;
    token: string;
    playerName: string;
    role: "gm";
  };
  session: PublicSessionState;
} {
  const now = new Date().toISOString();
  const host = createP2PPlayer(hostName, "gm");
  const sessionId = makeP2PId("session");
  const code = makeShortCode();
  const session: PublicSessionState = {
    id: sessionId,
    code,
    name: sanitizeText(sessionName, `Mesa P2P ${code}`, 70),
    createdAt: now,
    updatedAt: now,
    gmPlayerId: host.id,
    players: {
      [host.id]: host
    },
    characters: {},
    rollHistory: [],
    chatMessages: [],
    settings: { ...defaultSessionSettings },
    hasPassword: false
  };

  return {
    credentials: {
      code,
      playerId: host.id,
      token: makeP2PId("token"),
      playerName: host.name,
      role: "gm"
    },
    session
  };
}

export function addP2PPlayer(session: PublicSessionState, player: SessionPlayer): PublicSessionState {
  return touchSession({
    ...session,
    players: {
      ...session.players,
      [player.id]: player
    }
  });
}

export function updateP2PPlayer(
  session: PublicSessionState,
  senderId: string,
  payload: PlayerUpdatedPayload
): PublicSessionState {
  const player = session.players[senderId];

  if (!player) {
    return session;
  }

  return touchSession({
    ...session,
    players: {
      ...session.players,
      [senderId]: {
        ...player,
        name: sanitizeText(payload.name, player.name, 40),
        lastSeenAt: new Date().toISOString()
      }
    }
  });
}

export function markP2PPlayerLeft(session: PublicSessionState, playerId: string): PublicSessionState {
  const player = session.players[playerId];

  if (!player) {
    return session;
  }

  return touchSession({
    ...session,
    players: {
      ...session.players,
      [playerId]: {
        ...player,
        connected: false,
        lastSeenAt: new Date().toISOString()
      }
    }
  });
}

export function createP2PCharacter(
  session: PublicSessionState,
  senderId: string,
  character: OnlineCharacter
): PublicSessionState {
  const player = session.players[senderId];

  if (!player) {
    throw new Error("Jogador nao encontrado.");
  }

  const now = new Date().toISOString();
  const nextCharacter: OnlineCharacter = sanitizeCharacter({
    ...character,
    id: character.id || makeP2PId("char"),
    sessionId: session.id,
    ownerPlayerId: senderId,
    createdAt: character.createdAt || now,
    updatedAt: now,
    lastEditedByPlayerId: senderId,
    lastEditedByName: player.name
  });

  return touchSession({
    ...session,
    characters: {
      ...session.characters,
      [nextCharacter.id]: nextCharacter
    },
    players: {
      ...session.players,
      [senderId]: {
        ...player,
        characterIds: unique([...player.characterIds, nextCharacter.id])
      }
    }
  });
}

export function updateP2PCharacter(
  session: PublicSessionState,
  senderId: string,
  character: OnlineCharacter
): PublicSessionState {
  const existing = session.characters[character.id];
  const player = session.players[senderId];

  if (!existing || !player) {
    throw new Error("Ficha nao encontrada.");
  }

  if (!canEditP2PCharacter(session, senderId, existing)) {
    throw new Error("Voce nao pode editar esta ficha.");
  }

  const nextCharacter = sanitizeCharacter({
    ...existing,
    ...character,
    id: existing.id,
    sessionId: session.id,
    ownerPlayerId: existing.ownerPlayerId,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
    lastEditedByPlayerId: senderId,
    lastEditedByName: player.name
  });

  return touchSession({
    ...session,
    characters: {
      ...session.characters,
      [nextCharacter.id]: nextCharacter
    }
  });
}

export function deleteP2PCharacter(
  session: PublicSessionState,
  senderId: string,
  characterId: string
): PublicSessionState {
  const existing = session.characters[characterId];

  if (!existing) {
    throw new Error("Ficha nao encontrada.");
  }

  if (!canEditP2PCharacter(session, senderId, existing)) {
    throw new Error("Voce nao pode apagar esta ficha.");
  }

  const characters = { ...session.characters };
  delete characters[characterId];

  return touchSession({
    ...session,
    characters,
    players: Object.fromEntries(
      Object.entries(session.players).map(([id, player]) => [
        id,
        {
          ...player,
          characterIds: player.characterIds.filter((value) => value !== characterId)
        }
      ])
    )
  });
}

export function updateP2PSettings(
  session: PublicSessionState,
  senderId: string,
  settings: Partial<SessionSettings>,
  sessionName?: string
): PublicSessionState {
  if (senderId !== session.gmPlayerId) {
    throw new Error("Apenas o Mestre pode alterar a mesa.");
  }

  return touchSession({
    ...session,
    name: sessionName === undefined ? session.name : sanitizeText(sessionName, session.name, 70),
    settings: {
      ...session.settings,
      ...settings
    }
  });
}

export function createP2PRoll(
  session: PublicSessionState,
  senderId: string,
  payload: RollRequestPayload
): { roll: SessionRoll; session: PublicSessionState } {
  const player = session.players[senderId];

  if (!player) {
    throw new Error("Jogador nao encontrado.");
  }

  const character = payload.characterId ? session.characters[payload.characterId] : undefined;
  const dice: [number, number] = [secureD6(), secureD6()];
  const total = dice[0] + dice[1] + Number(payload.modifier || 0);
  const criticalType = getP2PCriticalType(dice);
  const difficulty = payload.difficulty;
  const roll: SessionRoll = {
    id: makeP2PId("roll"),
    sessionId: session.id,
    playerId: senderId,
    characterId: character?.id,
    playerName: player.name,
    characterName: character?.name,
    rollType: payload.rollType,
    dice,
    modifier: Number(payload.modifier || 0),
    total,
    difficulty,
    success: resolveP2PSuccess(total, difficulty, criticalType),
    criticalType,
    label: sanitizeText(payload.label, "Rolagem", 120),
    createdAt: new Date().toISOString()
  };

  return {
    roll,
    session: touchSession({
      ...session,
      rollHistory: [...session.rollHistory, roll].slice(-MAX_ROLLS)
    })
  };
}

export function createP2PChatMessage(
  session: PublicSessionState,
  senderId: string,
  payload: ChatRequestPayload
): { message: ChatMessage; session: PublicSessionState } {
  const player = session.players[senderId];

  if (!player) {
    throw new Error("Jogador nao encontrado.");
  }

  if (!session.settings.enableChat) {
    throw new Error("Chat desativado pelo Mestre.");
  }

  const message: ChatMessage = {
    id: makeP2PId("chat"),
    sessionId: session.id,
    playerId: player.id,
    playerName: player.name,
    message: sanitizeText(payload.message, "", 600),
    createdAt: new Date().toISOString()
  };

  if (!message.message) {
    throw new Error("Mensagem vazia.");
  }

  return {
    message,
    session: touchSession({
      ...session,
      chatMessages: [...session.chatMessages, message].slice(-MAX_CHAT)
    })
  };
}

export function canEditP2PCharacter(
  session: PublicSessionState,
  senderId: string,
  character: OnlineCharacter
): boolean {
  if (senderId === session.gmPlayerId) {
    return true;
  }

  return character.ownerPlayerId === senderId && session.settings.allowPlayersToEditAfterCreation;
}

export function isDuplicateEvent(seen: Set<string>, event: P2PEventEnvelope): boolean {
  if (seen.has(event.id)) {
    return true;
  }

  seen.add(event.id);
  return false;
}

export function secureD6(): number {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    return (value[0] % 6) + 1;
  }

  return Math.floor(Math.random() * 6) + 1;
}

export function getP2PCriticalType(dice: [number, number]): SessionRoll["criticalType"] {
  if (dice[0] === 6 && dice[1] === 6) {
    return "success";
  }

  if (dice[0] === 1 && dice[1] === 1) {
    return "failure";
  }

  return null;
}

function resolveP2PSuccess(
  total: number,
  difficulty: RollDifficulty | undefined,
  criticalType: SessionRoll["criticalType"]
): boolean | undefined {
  if (!difficulty) {
    return undefined;
  }

  if (criticalType === "success") {
    return true;
  }

  if (criticalType === "failure") {
    return false;
  }

  return total >= difficulty.target;
}

function sanitizeCharacter(character: OnlineCharacter): OnlineCharacter {
  return {
    ...character,
    name: sanitizeText(character.name, "Ficha sem nome", 80),
    age: sanitizeText(character.age, "", 20),
    originName: sanitizeText(character.originName, "", 80),
    professionName: sanitizeText(character.professionName, "", 80),
    appearance: sanitizeText(character.appearance, "", 1200),
    personality: sanitizeText(character.personality, "", 1200),
    history: sanitizeText(character.history, "", 2000),
    objective: sanitizeText(character.objective, "", 1000),
    notes: sanitizeText(character.notes, "", 3000),
    summary: sanitizeText(character.summary, "", 1200),
    lastEditedByName: sanitizeText(character.lastEditedByName, "", 40)
  };
}

function sanitizeText(value: unknown, fallback: string, maxLength: number): string {
  const text = typeof value === "string" ? value : fallback;
  const normalized = text.replace(/\s+/g, " ").trim();
  return (normalized || fallback).slice(0, maxLength);
}

function touchSession(session: PublicSessionState): PublicSessionState {
  return {
    ...session,
    updatedAt: new Date().toISOString()
  };
}

function makeShortCode(): string {
  return makeP2PId("p2p").slice(-6).replace(/[^a-z0-9]/gi, "X").toUpperCase();
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
