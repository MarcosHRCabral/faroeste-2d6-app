export type PlayerRole = "gm" | "player";
export type ConnectionStatus = "connected" | "reconnecting" | "disconnected";
export type CriticalType = "success" | "failure" | null;

export type AttributeKey = "forca" | "destreza" | "constituicao" | "inteligencia" | "sorte";

export type Attributes = Record<AttributeKey, number>;

export interface DerivedStats {
  maxHealth: number;
  maxEnergy: number;
  defense: number;
}

export interface SessionSettings {
  allowPlayersToViewOtherSheets: boolean;
  allowPlayersToEditAfterCreation: boolean;
  showRollsToEveryone: boolean;
  enableChat: boolean;
}

export interface SessionPlayer {
  id: string;
  name: string;
  role: PlayerRole;
  connected: boolean;
  joinedAt: string;
  lastSeenAt: string;
  characterIds: string[];
}

export interface OnlineSkill {
  id: string;
  name: string;
  attribute: AttributeKey;
  bonus: number;
  notes: string;
  supernatural?: boolean;
}

export interface OnlineGearItem {
  id: string;
  name: string;
  notes: string;
}

export interface OnlineWeapon {
  id: string;
  name: string;
  damage: string;
  range: string;
  notes: string;
}

export interface OnlineCharacter {
  id: string;
  sessionId: string;
  ownerPlayerId: string;
  name: string;
  age: string;
  originId: string;
  originName: string;
  professionId: string;
  professionName: string;
  appearance: string;
  personality: string;
  history: string;
  objective: string;
  attributes: Attributes;
  derived: DerivedStats;
  currentHealth: number;
  currentEnergy: number;
  skills: OnlineSkill[];
  equipment: OnlineGearItem[];
  weapons: OnlineWeapon[];
  money: number;
  advantages: string[];
  disadvantages: string[];
  notes: string;
  summary: string;
  supernaturalEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastEditedByPlayerId?: string;
  lastEditedByName?: string;
}

export interface RollDifficulty {
  id?: string;
  label: string;
  target: number;
}

export interface SessionRoll {
  id: string;
  sessionId: string;
  playerId: string;
  characterId?: string;
  playerName: string;
  characterName?: string;
  rollType: string;
  dice: [number, number];
  modifier: number;
  total: number;
  difficulty?: RollDifficulty;
  success?: boolean;
  criticalType: CriticalType;
  label: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  playerId: string;
  playerName: string;
  message: string;
  createdAt: string;
}

export interface PublicSessionState {
  id: string;
  code: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  gmPlayerId: string;
  players: Record<string, SessionPlayer>;
  characters: Record<string, OnlineCharacter>;
  rollHistory: SessionRoll[];
  chatMessages: ChatMessage[];
  settings: SessionSettings;
  hasPassword: boolean;
  endedAt?: string;
}

export interface SessionCredentials {
  code: string;
  playerId: string;
  token: string;
  playerName: string;
  role: PlayerRole;
}

export interface CreateSessionPayload {
  playerName: string;
  sessionName?: string;
  password?: string;
}

export interface JoinSessionPayload {
  code: string;
  playerName: string;
  role?: PlayerRole;
  password?: string;
  playerId?: string;
  token?: string;
}

export interface UpdatePlayerPayload {
  code: string;
  playerId: string;
  token: string;
  name: string;
}

export interface AuthPayload {
  code: string;
  playerId: string;
  token: string;
}

export interface CharacterPayload extends AuthPayload {
  character: OnlineCharacter;
}

export interface CharacterIdPayload extends AuthPayload {
  characterId: string;
}

export interface RollDicePayload extends AuthPayload {
  characterId?: string;
  rollType: string;
  label: string;
  modifier: number;
  difficulty?: RollDifficulty;
}

export interface ChatMessagePayload extends AuthPayload {
  message: string;
}

export interface GmSettingsPayload extends AuthPayload {
  settings: Partial<SessionSettings>;
  sessionName?: string;
}

export interface GmPlayerActionPayload extends AuthPayload {
  targetPlayerId: string;
}

export interface SessionError {
  message: string;
  code?: string;
}

export const defaultSessionSettings: SessionSettings = {
  allowPlayersToViewOtherSheets: true,
  allowPlayersToEditAfterCreation: true,
  showRollsToEveryone: true,
  enableChat: true
};
