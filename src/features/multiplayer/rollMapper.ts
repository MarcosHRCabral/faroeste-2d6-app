import type { SessionRoll } from "../../../shared/session";
import type { RollResult } from "../../types";

export function toRollResult(roll: SessionRoll | undefined): RollResult | undefined {
  if (!roll) {
    return undefined;
  }

  return {
    id: roll.id,
    source: roll.label,
    dice: roll.dice,
    diceTotal: roll.dice[0] + roll.dice[1],
    modifiers: [{ label: "Modificador", value: roll.modifier }],
    totalModifier: roll.modifier,
    total: roll.total,
    difficulty: roll.difficulty
      ? {
          id: "normal",
          label: roll.difficulty.label,
          target: roll.difficulty.target
        }
      : undefined,
    success: roll.success,
    critical:
      roll.criticalType === "success" ? "success" : roll.criticalType === "failure" ? "failure" : "none",
    createdAt: roll.createdAt
  };
}
