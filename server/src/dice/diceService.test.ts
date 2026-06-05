import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getCritical, resolveSuccess, roll2d6 } from "./diceService";

describe("server dice service", () => {
  it("detects critical rolls", () => {
    assert.equal(getCritical([6, 6]), "success");
    assert.equal(getCritical([1, 1]), "failure");
    assert.equal(getCritical([3, 4]), null);
  });

  it("resolves success with difficulty and critical override", () => {
    assert.equal(resolveSuccess(8, { label: "Normal", target: 9 }, null), false);
    assert.equal(resolveSuccess(8, { label: "Normal", target: 9 }, "success"), true);
    assert.equal(resolveSuccess(30, { label: "Facil", target: 7 }, "failure"), false);
  });

  it("rolls 2d6 on the server", () => {
    const result = roll2d6({
      sessionId: "session",
      playerId: "player",
      playerName: "Rosa",
      rollType: "Teste",
      label: "Armas de fogo",
      modifier: 2,
      difficulty: { label: "Normal", target: 9 }
    });

    assert.equal(result.dice.length, 2);
    assert.ok(result.dice.every((die) => die >= 1 && die <= 6));
    assert.equal(result.total, result.dice[0] + result.dice[1] + 2);
    assert.equal(result.playerName, "Rosa");
  });
});
