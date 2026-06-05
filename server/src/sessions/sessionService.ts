import type {
  ChatMessage,
  CreateSessionPayload,
  GmPlayerActionPayload,
  GmSettingsPayload,
  JoinSessionPayload,
  OnlineCharacter,
  PublicSessionState,
  SessionCredentials,
  SessionPlayer,
  SessionSettings,
  UpdatePlayerPayload
} from "../../../shared/session";
import { defaultSessionSettings } from "../../../shared/session";
import { makeId, makeToken, hashPassword, hashToken, verifyPassword, verifyToken } from "../auth/simpleAuth";
import { roll2d6, type RollInput } from "../dice/diceService";
import { generateCode } from "../utils/generateCode";
import { clampNumber, sanitizeMultiline, sanitizeText } from "../utils/sanitize";
import {
  asPublicSession,
  createSessionDb,
  pruneSession,
  type SessionDb,
  type StoredPlayer,
  type StoredSession
} from "./sessionStore";

const MAX_NAME = 40;
const MAX_SESSION_NAME = 70;

export class SessionError extends Error {
  constructor(
    message: string,
    public code = "session_error"
  ) {
    super(message);
  }
}

export interface AuthContext {
  session: StoredSession;
  player: StoredPlayer;
}

export interface ServerRollPayload {
  code: string;
  playerId: string;
  token: string;
  characterId?: string;
  rollType: string;
  label: string;
  modifier: number;
  difficulty?: RollInput["difficulty"];
}

export class SessionService {
  private dbPromise: Promise<SessionDb>;

  constructor(filePath?: string) {
    this.dbPromise = createSessionDb(filePath);
  }

  private async db(): Promise<SessionDb> {
    return this.dbPromise;
  }

  async listSessionCodes(): Promise<string[]> {
    const db = await this.db();
    return Object.keys(db.data.sessions);
  }

  private async writeSession(session: StoredSession): Promise<void> {
    const db = await this.db();
    session.updatedAt = new Date().toISOString();
    db.data.sessions[session.code] = pruneSession(session);
    await db.write();
  }

  private async getSession(code: string): Promise<StoredSession> {
    const db = await this.db();
    const session = db.data.sessions[normalizeCode(code)];

    if (!session || session.endedAt) {
      throw new SessionError("Sessao nao encontrada.", "session_not_found");
    }

    return session;
  }

  async createSession(payload: CreateSessionPayload): Promise<{
    credentials: SessionCredentials;
    session: PublicSessionState;
  }> {
    const db = await this.db();
    const now = new Date().toISOString();
    const code = await this.makeUniqueCode();
    const playerId = makeId("player");
    const token = makeToken();
    const playerName = sanitizeText(payload.playerName, MAX_NAME, "Mestre");
    const player: StoredPlayer = {
      id: playerId,
      name: playerName,
      role: "gm",
      connected: true,
      joinedAt: now,
      lastSeenAt: now,
      characterIds: [],
      tokenHash: await hashToken(token)
    };
    const session: StoredSession = {
      id: makeId("session"),
      code,
      name: sanitizeText(payload.sessionName, MAX_SESSION_NAME, `Mesa ${code}`),
      createdAt: now,
      updatedAt: now,
      gmPlayerId: playerId,
      players: {
        [playerId]: player
      },
      characters: {},
      rollHistory: [],
      chatMessages: [],
      settings: { ...defaultSessionSettings },
      passwordHash: payload.password ? await hashPassword(payload.password) : undefined
    };

    db.data.sessions[code] = session;
    await db.write();

    return {
      credentials: {
        code,
        playerId,
        token,
        playerName,
        role: "gm"
      },
      session: asPublicSession(session)
    };
  }

  async joinSession(payload: JoinSessionPayload): Promise<{
    credentials: SessionCredentials;
    session: PublicSessionState;
    existingPlayer: boolean;
  }> {
    const session = await this.getSession(payload.code);
    const now = new Date().toISOString();
    const requestedPlayer = payload.playerId ? session.players[payload.playerId] : undefined;

    if (requestedPlayer && payload.token && (await verifyToken(payload.token, requestedPlayer.tokenHash))) {
      requestedPlayer.connected = true;
      requestedPlayer.lastSeenAt = now;
      requestedPlayer.name = sanitizeText(payload.playerName, MAX_NAME, requestedPlayer.name);
      await this.writeSession(session);

      return {
        credentials: {
          code: session.code,
          playerId: requestedPlayer.id,
          token: payload.token,
          playerName: requestedPlayer.name,
          role: requestedPlayer.role
        },
        session: asPublicSession(session),
        existingPlayer: true
      };
    }

    if (session.passwordHash) {
      if (!payload.password || !(await verifyPassword(payload.password, session.passwordHash))) {
        throw new SessionError("Senha da sala incorreta.", "invalid_password");
      }
    }

    const playerId = makeId("player");
    const token = makeToken();
    const playerName = sanitizeText(payload.playerName, MAX_NAME, "Jogador");
    const player: StoredPlayer = {
      id: playerId,
      name: playerName,
      role: "player",
      connected: true,
      joinedAt: now,
      lastSeenAt: now,
      characterIds: [],
      tokenHash: await hashToken(token)
    };

    session.players[playerId] = player;
    await this.writeSession(session);

    return {
      credentials: {
        code: session.code,
        playerId,
        token,
        playerName,
        role: "player"
      },
      session: asPublicSession(session),
      existingPlayer: false
    };
  }

  async authenticate(code: string, playerId: string, token: string): Promise<AuthContext> {
    const session = await this.getSession(code);
    const player = session.players[playerId];

    if (!player || !(await verifyToken(token, player.tokenHash))) {
      throw new SessionError("Acesso invalido para esta sessao.", "invalid_auth");
    }

    player.lastSeenAt = new Date().toISOString();
    return { session, player };
  }

  async getState(code: string, playerId: string, token: string): Promise<PublicSessionState> {
    const { session } = await this.authenticate(code, playerId, token);
    return asPublicSession(session);
  }

  async updatePlayer(payload: UpdatePlayerPayload): Promise<PublicSessionState> {
    const { session, player } = await this.authenticate(payload.code, payload.playerId, payload.token);
    player.name = sanitizeText(payload.name, MAX_NAME, player.name);
    await this.writeSession(session);
    return asPublicSession(session);
  }

  async disconnectPlayer(code: string, playerId: string, token?: string): Promise<PublicSessionState | null> {
    try {
      const session = await this.getSession(code);
      const player = session.players[playerId];

      if (!player) {
        return null;
      }

      if (token && !(await verifyToken(token, player.tokenHash))) {
        return null;
      }

      player.connected = false;
      player.lastSeenAt = new Date().toISOString();
      await this.writeSession(session);
      return asPublicSession(session);
    } catch {
      return null;
    }
  }

  async createCharacter(
    code: string,
    playerId: string,
    token: string,
    character: OnlineCharacter
  ): Promise<PublicSessionState> {
    const { session, player } = await this.authenticate(code, playerId, token);
    const now = new Date().toISOString();
    const sanitized = sanitizeCharacter({
      ...character,
      id: character.id || makeId("char"),
      sessionId: session.id,
      ownerPlayerId: player.id,
      createdAt: character.createdAt || now,
      updatedAt: now,
      lastEditedByPlayerId: player.id,
      lastEditedByName: player.name
    });

    session.characters[sanitized.id] = sanitized;
    player.characterIds = unique([...player.characterIds, sanitized.id]);
    await this.writeSession(session);
    return asPublicSession(session);
  }

  async updateCharacter(
    code: string,
    playerId: string,
    token: string,
    character: OnlineCharacter
  ): Promise<PublicSessionState> {
    const { session, player } = await this.authenticate(code, playerId, token);
    const existing = session.characters[character.id];

    if (!existing) {
      throw new SessionError("Ficha nao encontrada.", "character_not_found");
    }

    if (!canEditCharacter(session, player, existing)) {
      throw new SessionError("Voce nao pode editar esta ficha.", "permission_denied");
    }

    session.characters[existing.id] = sanitizeCharacter({
      ...existing,
      ...character,
      id: existing.id,
      sessionId: session.id,
      ownerPlayerId: existing.ownerPlayerId,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
      lastEditedByPlayerId: player.id,
      lastEditedByName: player.name
    });
    await this.writeSession(session);
    return asPublicSession(session);
  }

  async deleteCharacter(code: string, playerId: string, token: string, characterId: string): Promise<PublicSessionState> {
    const { session, player } = await this.authenticate(code, playerId, token);
    const existing = session.characters[characterId];

    if (!existing) {
      throw new SessionError("Ficha nao encontrada.", "character_not_found");
    }

    if (!canEditCharacter(session, player, existing)) {
      throw new SessionError("Voce nao pode apagar esta ficha.", "permission_denied");
    }

    delete session.characters[characterId];
    Object.values(session.players).forEach((sessionPlayer) => {
      sessionPlayer.characterIds = sessionPlayer.characterIds.filter((id) => id !== characterId);
    });
    await this.writeSession(session);
    return asPublicSession(session);
  }

  async rollDice(payload: ServerRollPayload): Promise<{
    roll: ReturnType<typeof roll2d6>;
    session: PublicSessionState;
  }> {
    const { session, player } = await this.authenticate(payload.code, payload.playerId, payload.token);
    const character = payload.characterId ? session.characters[payload.characterId] : undefined;
    const roll = roll2d6({
      ...payload,
      sessionId: session.id,
      playerName: player.name,
      characterName: character?.name
    });

    if (session.settings.showRollsToEveryone || player.role === "gm") {
      session.rollHistory.push(roll);
    }

    await this.writeSession(session);
    return { roll, session: asPublicSession(session) };
  }

  async sendChatMessage(code: string, playerId: string, token: string, message: string): Promise<{
    message: ChatMessage;
    session: PublicSessionState;
  }> {
    const { session, player } = await this.authenticate(code, playerId, token);

    if (!session.settings.enableChat) {
      throw new SessionError("Chat desativado pelo Mestre.", "chat_disabled");
    }

    const chatMessage: ChatMessage = {
      id: makeId("chat"),
      sessionId: session.id,
      playerId: player.id,
      playerName: player.name,
      message: sanitizeMultiline(message, 600),
      createdAt: new Date().toISOString()
    };

    if (!chatMessage.message) {
      throw new SessionError("Mensagem vazia.", "empty_message");
    }

    session.chatMessages.push(chatMessage);
    await this.writeSession(session);
    return { message: chatMessage, session: asPublicSession(session) };
  }

  async updateGmSettings(payload: GmSettingsPayload): Promise<PublicSessionState> {
    const { session, player } = await this.authenticate(payload.code, payload.playerId, payload.token);
    requireGm(session, player);
    session.settings = sanitizeSettings({ ...session.settings, ...payload.settings });

    if (payload.sessionName !== undefined) {
      session.name = sanitizeText(payload.sessionName, MAX_SESSION_NAME, session.name);
    }

    await this.writeSession(session);
    return asPublicSession(session);
  }

  async kickPlayer(payload: GmPlayerActionPayload): Promise<PublicSessionState> {
    const { session, player } = await this.authenticate(payload.code, payload.playerId, payload.token);
    requireGm(session, player);

    if (payload.targetPlayerId === session.gmPlayerId) {
      throw new SessionError("O Mestre nao pode expulsar a si mesmo.", "permission_denied");
    }

    const target = session.players[payload.targetPlayerId];

    if (target) {
      target.connected = false;
      target.lastSeenAt = new Date().toISOString();
    }

    await this.writeSession(session);
    return asPublicSession(session);
  }

  async endSession(code: string, playerId: string, token: string): Promise<PublicSessionState> {
    const { session, player } = await this.authenticate(code, playerId, token);
    requireGm(session, player);
    session.endedAt = new Date().toISOString();
    await this.writeSession(session);
    return asPublicSession(session);
  }

  private async makeUniqueCode(): Promise<string> {
    const db = await this.db();

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const code = generateCode();

      if (!db.data.sessions[code]) {
        return code;
      }
    }

    throw new SessionError("Nao foi possivel gerar um codigo de sala.", "code_generation_failed");
  }
}

export function normalizeCode(code: string): string {
  return sanitizeText(code, 12).toUpperCase();
}

function requireGm(session: StoredSession, player: SessionPlayer): void {
  if (player.role !== "gm" || player.id !== session.gmPlayerId) {
    throw new SessionError("Apenas o Mestre pode fazer isso.", "permission_denied");
  }
}

function canEditCharacter(session: StoredSession, player: SessionPlayer, character: OnlineCharacter): boolean {
  if (player.role === "gm" && player.id === session.gmPlayerId) {
    return true;
  }

  return character.ownerPlayerId === player.id && session.settings.allowPlayersToEditAfterCreation;
}

function sanitizeCharacter(character: OnlineCharacter): OnlineCharacter {
  const attributes = {
    forca: clampNumber(character.attributes?.forca, -10, 20),
    destreza: clampNumber(character.attributes?.destreza, -10, 20),
    constituicao: clampNumber(character.attributes?.constituicao, -10, 20),
    inteligencia: clampNumber(character.attributes?.inteligencia, -10, 20),
    sorte: clampNumber(character.attributes?.sorte, -10, 20)
  };
  const derived = {
    maxHealth: Math.max(1, 10 + attributes.constituicao * 2),
    maxEnergy: Math.max(1, 6 + attributes.constituicao + attributes.sorte),
    defense: Math.max(1, 7 + attributes.destreza)
  };

  return {
    ...character,
    name: sanitizeText(character.name, 80, "Ficha sem nome"),
    age: sanitizeText(character.age, 20),
    originId: sanitizeText(character.originId, 60),
    originName: sanitizeText(character.originName, 80),
    professionId: sanitizeText(character.professionId, 60),
    professionName: sanitizeText(character.professionName, 80),
    appearance: sanitizeMultiline(character.appearance, 1200),
    personality: sanitizeMultiline(character.personality, 1200),
    history: sanitizeMultiline(character.history, 2000),
    objective: sanitizeMultiline(character.objective, 1000),
    attributes,
    derived,
    currentHealth: clampNumber(character.currentHealth, -999, derived.maxHealth),
    currentEnergy: clampNumber(character.currentEnergy, -999, derived.maxEnergy),
    money: clampNumber(character.money, -99999, 99999),
    skills: Array.isArray(character.skills)
      ? character.skills.slice(0, 80).map((skill) => ({
          ...skill,
          id: sanitizeText(skill.id, 80, makeId("skill")),
          name: sanitizeText(skill.name, 80, "Pericia"),
          notes: sanitizeMultiline(skill.notes, 500),
          bonus: clampNumber(skill.bonus, -20, 40)
        }))
      : [],
    equipment: Array.isArray(character.equipment)
      ? character.equipment.slice(0, 120).map((item) => ({
          ...item,
          id: sanitizeText(item.id, 80, makeId("gear")),
          name: sanitizeText(item.name, 100, "Item"),
          notes: sanitizeMultiline(item.notes, 500)
        }))
      : [],
    weapons: Array.isArray(character.weapons)
      ? character.weapons.slice(0, 60).map((weapon) => ({
          ...weapon,
          id: sanitizeText(weapon.id, 80, makeId("weapon")),
          name: sanitizeText(weapon.name, 100, "Arma"),
          damage: sanitizeText(weapon.damage, 40),
          range: sanitizeText(weapon.range, 40),
          notes: sanitizeMultiline(weapon.notes, 500)
        }))
      : [],
    advantages: sanitizeList(character.advantages, 40, 100),
    disadvantages: sanitizeList(character.disadvantages, 40, 100),
    notes: sanitizeMultiline(character.notes, 3000),
    summary: sanitizeMultiline(character.summary, 1200),
    lastEditedByName: sanitizeText(character.lastEditedByName, MAX_NAME)
  };
}

function sanitizeList(values: unknown, maxItems: number, maxLength: number): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .slice(0, maxItems)
    .map((value) => sanitizeText(value, maxLength))
    .filter(Boolean);
}

function sanitizeSettings(settings: SessionSettings): SessionSettings {
  return {
    allowPlayersToViewOtherSheets: Boolean(settings.allowPlayersToViewOtherSheets),
    allowPlayersToEditAfterCreation: Boolean(settings.allowPlayersToEditAfterCreation),
    showRollsToEveryone: Boolean(settings.showRollsToEveryone),
    enableChat: Boolean(settings.enableChat)
  };
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
