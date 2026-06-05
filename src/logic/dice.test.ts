import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { difficulties, roll2d6, rollOpposed } from "./dice";

function randomSequence(values: number[]) {
  let index = 0;
  return () => values[index++] ?? 0;
}

describe("dice roller", () => {
  it("adds 2d6, modifiers and difficulty result", () => {
    const result = roll2d6(
      "Teste",
      [
        { label: "Atributo", value: 2 },
        { label: "Pericia", value: 1 }
      ],
      difficulties[1],
      randomSequence([0.5, 0.5])
    );

    assert.deepEqual(result.dice, [4, 4]);
    assert.equal(result.diceTotal, 8);
    assert.equal(result.totalModifier, 3);
    assert.equal(result.total, 11);
    assert.equal(result.success, true);
  });

  it("marks double six as critical success", () => {
    const result = roll2d6("Critico", [], difficulties[4], randomSequence([0.99, 0.99]));

    assert.deepEqual(result.dice, [6, 6]);
    assert.equal(result.critical, "success");
    assert.equal(result.success, true);
  });

  it("marks double one as critical failure", () => {
    const result = roll2d6(
      "Falha critica",
      [{ label: "Bonus", value: 20 }],
      difficulties[0],
      randomSequence([0, 0])
    );

    assert.deepEqual(result.dice, [1, 1]);
    assert.equal(result.critical, "failure");
    assert.equal(result.success, false);
  });

  it("compares totals in opposed rolls", () => {
    const result = rollOpposed(
      "Disputa",
      [{ label: "Jogador", value: 1 }],
      "Rival",
      [{ label: "Rival", value: 2 }],
      randomSequence([0.5, 0.5, 0, 0])
    );

    assert.equal(result.total, 9);
    assert.equal(result.opposed?.total, 4);
    assert.equal(result.opposed?.outcome, "win");
    assert.equal(result.success, true);
  });
});
