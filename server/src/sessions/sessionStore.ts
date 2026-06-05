import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { JSONFilePreset } from "lowdb/node";
import type {
  ChatMessage,
  OnlineCharacter,
  PublicSessionState,
  SessionPlayer,
  SessionRoll
} from "../../../shared/session";

export interface StoredPlayer extends SessionPlayer {
  tokenHash: string;
}

export interface StoredSession extends Omit<PublicSessionState, "players" | "hasPassword"> {
  passwordHash?: string;
  players: Record<string, StoredPlayer>;
}

export interface DatabaseSchema {
  sessions: Record<string, StoredSession>;
}

export type SessionDb = Awaited<ReturnType<typeof JSONFilePreset<DatabaseSchema>>>;

export async function createSessionDb(filePath = "server/data/db.json"): Promise<SessionDb> {
  const resolved = resolve(filePath);
  await mkdir(dirname(resolved), { recursive: true });
  return JSONFilePreset<DatabaseSchema>(resolved, { sessions: {} });
}

export function asPublicSession(session: StoredSession): PublicSessionState {
  const players = Object.fromEntries(
    Object.entries(session.players).map(([id, player]) => {
      const { tokenHash: _tokenHash, ...safePlayer } = player;
      return [id, safePlayer];
    })
  );

  return {
    ...session,
    players,
    hasPassword: Boolean(session.passwordHash)
  };
}

export function pruneSession(session: StoredSession): StoredSession {
  return {
    ...session,
    rollHistory: session.rollHistory.slice(-100) as SessionRoll[],
    chatMessages: session.chatMessages.slice(-100) as ChatMessage[],
    characters: session.characters as Record<string, OnlineCharacter>
  };
}
