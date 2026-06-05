import type {
  CriticalType,
  Difficulty,
  DifficultyId,
  ModifierBreakdown,
  OpposedRollSummary,
  RollResult
} from "../types";

export const difficulties: Difficulty[] = [
  { id: "facil", label: "Facil", target: 7 },
  { id: "normal", label: "Normal", target: 9 },
  { id: "dificil", label: "Dificil", target: 11 },
  { id: "muito-dificil", label: "Muito dificil", target: 13 },
  { id: "quase-impossivel", label: "Quase impossivel", target: 15 }
];

export const defaultDifficulty = difficulties[1];

export function findDifficulty(id: DifficultyId): Difficulty {
  return difficulties.find((difficulty) => difficulty.id === id) ?? defaultDifficulty;
}

export function makeId(prefix = "id"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function rollDie(random = Math.random): number {
  return Math.floor(random() * 6) + 1;
}

export function getCritical(dice: [number, number]): CriticalType {
  if (dice[0] === 6 && dice[1] === 6) {
    return "success";
  }

  if (dice[0] === 1 && dice[1] === 1) {
    return "failure";
  }

  return "none";
}

export function totalModifiers(modifiers: ModifierBreakdown[]): number {
  return modifiers.reduce((total, modifier) => total + Number(modifier.value || 0), 0);
}

export function resolveSuccess(total: number, difficulty: Difficulty, critical: CriticalType): boolean {
  if (critical === "success") {
    return true;
  }

  if (critical === "failure") {
    return false;
  }

  return total >= difficulty.target;
}

export function roll2d6(
  source: string,
  modifiers: ModifierBreakdown[] = [],
  difficulty: Difficulty = defaultDifficulty,
  random = Math.random
): RollResult {
  const dice: [number, number] = [rollDie(random), rollDie(random)];
  const diceTotal = dice[0] + dice[1];
  const totalModifier = totalModifiers(modifiers);
  const total = diceTotal + totalModifier;
  const critical = getCritical(dice);

  return {
    id: makeId("roll"),
    source,
    dice,
    diceTotal,
    modifiers,
    totalModifier,
    total,
    difficulty,
    success: resolveSuccess(total, difficulty, critical),
    critical,
    createdAt: new Date().toISOString()
  };
}

function rollOpposedSide(
  label: string,
  modifiers: ModifierBreakdown[],
  random: () => number
): Omit<OpposedRollSummary, "outcome"> {
  const dice: [number, number] = [rollDie(random), rollDie(random)];
  const diceTotal = dice[0] + dice[1];
  const totalModifier = totalModifiers(modifiers);
  const total = diceTotal + totalModifier;

  return {
    label,
    dice,
    diceTotal,
    modifiers,
    totalModifier,
    total,
    critical: getCritical(dice)
  };
}

export function rollOpposed(
  source: string,
  actorModifiers: ModifierBreakdown[] = [],
  opponentLabel = "Oponente",
  opponentModifiers: ModifierBreakdown[] = [],
  random = Math.random
): RollResult {
  const actor = rollOpposedSide(source, actorModifiers, random);
  const opponent = rollOpposedSide(opponentLabel, opponentModifiers, random);
  const outcome: OpposedRollSummary["outcome"] =
    actor.total > opponent.total ? "win" : actor.total < opponent.total ? "loss" : "tie";

  return {
    id: makeId("roll"),
    source,
    dice: actor.dice,
    diceTotal: actor.diceTotal,
    modifiers: actor.modifiers,
    totalModifier: actor.totalModifier,
    total: actor.total,
    critical: actor.critical,
    success: outcome !== "loss",
    opposed: {
      ...opponent,
      outcome
    },
    createdAt: new Date().toISOString()
  };
}
