import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { origins } from "../data/origins";
import { professions } from "../data/professions";
import { skillTemplates } from "../data/skills";
import {
  buildCharacter,
  calculateDerived,
  createSkills,
  defaultAttributes,
  duplicateCharacter,
  validateImportedCharacter,
  validateInitialAttributes
} from "./character";

describe("character logic", () => {
  it("calculates derived stats from attributes", () => {
    assert.deepEqual(calculateDerived({
      forca: 1,
      destreza: 2,
      constituicao: 3,
      inteligencia: 0,
      sorte: 1
    }), {
      maxHealth: 16,
      maxEnergy: 10,
      defense: 9
    });
  });

  it("validates initial attribute point rules", () => {
    assert.ok(
      validateInitialAttributes(defaultAttributes).includes("Distribua exatamente 8 pontos. Atual: 0.")
    );
    assert.deepEqual(validateInitialAttributes({
      forca: 4,
      destreza: 2,
      constituicao: 1,
      inteligencia: 1,
      sorte: 0
    }), []);
  });

  it("builds a playable starting character", () => {
    const origin = origins[0];
    const profession = professions[0];
    const character = buildCharacter({
      name: "Elias Ward",
      age: "34",
      appearance: "",
      personality: "",
      history: "",
      objective: "Quitar uma divida antiga.",
      origin,
      profession,
      attributes: {
        forca: 2,
        destreza: 2,
        constituicao: 2,
        inteligencia: 1,
        sorte: 1
      },
      skills: createSkills(skillTemplates, { "armas-fogo": 2 }, false),
      extraEquipment: ["Poncho"],
      extraWeapons: [],
      money: profession.money,
      supernaturalEnabled: false
    });

    assert.equal(character.name, "Elias Ward");
    assert.equal(character.currentHealth, character.derived.maxHealth);
    assert.ok(character.equipment.map((item) => item.name).includes("Poncho"));
    assert.ok(character.weapons.length > 0);
  });

  it("duplicates without reusing ids", () => {
    const character = validateImportedCharacter({
      name: "Rosa",
      attributes: defaultAttributes
    })!;
    const copy = duplicateCharacter(character);

    assert.notEqual(copy.id, character.id);
    assert.ok(copy.name.includes("(copia)"));
  });

  it("rejects invalid imports", () => {
    assert.equal(validateImportedCharacter({ attributes: defaultAttributes }), null);
  });
});
