import { randomInt } from "node:crypto";
import type { CriticalType, RollDifficulty, SessionRoll } from "../../../shared/session";
import { makeId } from "../auth/simpleAuth";
import { clampNumber, sanitizeText } from "../utils/sanitize";

export interface RollInput {
  sessionId: string;
  playerId: string;
  playerName: string;
  characterId?: string;
  characterName?: string;
  rollType: string;
  label: string;
  modifier: number;
  difficulty?: RollDifficulty;
}

export function getCritical(dice: [number, number]): CriticalType {
  if (dice[0] === 6 && dice[1] === 6) {
    return "success";
  }

  if (dice[0] === 1 && dice[1] === 1) {
    return "failure";
  }

  return null;
}

export function resolveSuccess(
  total: number,
  difficulty: RollDifficulty | undefined,
  criticalType: CriticalType
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

export function rollD6(): number {
  return randomInt(1, 7);
}

export function roll2d6(input: RollInput): SessionRoll {
  const dice: [number, number] = [rollD6(), rollD6()];
  const modifier = clampNumber(input.modifier, -50, 50);
  const total = dice[0] + dice[1] + modifier;
  const criticalType = getCritical(dice);
  const difficulty = input.difficulty
    ? {
        id: sanitizeText(input.difficulty.id, 32),
        label: sanitizeText(input.difficulty.label, 40, "Dificuldade"),
        target: clampNumber(input.difficulty.target, 2, 40, 9)
      }
    : undefined;

  return {
    id: makeId("roll"),
    sessionId: input.sessionId,
    playerId: input.playerId,
    characterId: input.characterId,
    playerName: input.playerName,
    characterName: input.characterName,
    rollType: sanitizeText(input.rollType, 60, "Teste"),
    dice,
    modifier,
    total,
    difficulty,
    success: resolveSuccess(total, difficulty, criticalType),
    criticalType,
    label: sanitizeText(input.label, 80, "Rolagem"),
    createdAt: new Date().toISOString()
  };
}
