import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { OnlineCharacter } from "../../../shared/session";
import {
  canEditP2PCharacter,
  createP2PCharacter,
  createP2PPlayer,
  createP2PSession,
  getP2PCriticalType,
  isDuplicateEvent,
  makeP2PEvent,
  updateP2PCharacter
} from "./p2pSessionLogic";
import { addP2PPlayer } from "./p2pSessionLogic";

describe("p2p session logic", () => {
  it("detects critical dice", () => {
    assert.equal(getP2PCriticalType([6, 6]), "success");
    assert.equal(getP2PCriticalType([1, 1]), "failure");
    assert.equal(getP2PCriticalType([3, 4]), null);
  });

  it("ignores duplicate event ids", () => {
    const seen = new Set<string>();
    const event = makeP2PEvent("sync_request", "player-1", {});

    assert.equal(isDuplicateEvent(seen, event), false);
    assert.equal(isDuplicateEvent(seen, event), true);
  });

  it("enforces character edit permissions", () => {
    const created = createP2PSession("Mestre", "Mesa");
    const hostId = created.credentials.playerId;
    const player = createP2PPlayer("Jogador", "player", "player-2");
    const withPlayer = addP2PPlayer(created.session, player);
    const character = makeCharacter("char-1", player.id);
    const withCharacter = createP2PCharacter(withPlayer, player.id, character);

    assert.equal(canEditP2PCharacter(withCharacter, player.id, withCharacter.characters["char-1"]), true);
    assert.equal(canEditP2PCharacter(withCharacter, hostId, withCharacter.characters["char-1"]), true);

    const stranger = createP2PPlayer("Outro", "player", "player-3");
    const withStranger = addP2PPlayer(withCharacter, stranger);

    assert.throws(
      () =>
        updateP2PCharacter(withStranger, stranger.id, {
          ...withStranger.characters["char-1"],
          name: "Ficha invadida"
        }),
      /Voce nao pode editar/
    );
  });
});

function makeCharacter(id: string, ownerPlayerId: string): OnlineCharacter {
  const now = new Date().toISOString();

  return {
    id,
    sessionId: "session",
    ownerPlayerId,
    name: "Joao",
    age: "30",
    originId: "origem",
    originName: "Fronteira",
    professionId: "pistoleiro",
    professionName: "Pistoleiro",
    appearance: "",
    personality: "",
    history: "",
    objective: "",
    attributes: {
      forca: 1,
      destreza: 2,
      constituicao: 1,
      inteligencia: 0,
      sorte: 0
    },
    derived: {
      maxHealth: 12,
      maxEnergy: 7,
      defense: 9
    },
    currentHealth: 12,
    currentEnergy: 7,
    skills: [],
    equipment: [],
    weapons: [],
    money: 10,
    advantages: [],
    disadvantages: [],
    notes: "",
    summary: "",
    supernaturalEnabled: false,
    createdAt: now,
    updatedAt: now
  };
}
