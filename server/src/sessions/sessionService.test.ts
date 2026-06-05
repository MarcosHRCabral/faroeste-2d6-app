import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import type { OnlineCharacter } from "../../../shared/session";
import { SessionService } from "./sessionService";

describe("SessionService", () => {
  it("creates and joins private sessions", async () => {
    const service = await makeService();
    const created = await service.createSession({
      playerName: "Mestre",
      sessionName: "Mesa de Teste",
      password: "segredo"
    });

    assert.equal(created.credentials.role, "gm");
    assert.equal(created.session.hasPassword, true);
    assert.match(created.credentials.code, /^[A-Z2-9]{6}$/);

    await assert.rejects(
      () =>
        service.joinSession({
          code: created.credentials.code,
          playerName: "Jogador",
          password: "errada"
        }),
      /Senha da sala incorreta/
    );

    const joined = await service.joinSession({
      code: created.credentials.code,
      playerName: "Jogador",
      role: "gm",
      password: "segredo"
    });

    assert.equal(joined.credentials.role, "player");
    assert.equal(Object.keys(joined.session.players).length, 2);
  });

  it("enforces character editing permissions", async () => {
    const service = await makeService();
    const gm = await service.createSession({ playerName: "Mestre" });
    const player = await service.joinSession({
      code: gm.credentials.code,
      playerName: "Jogador"
    });
    const stranger = await service.joinSession({
      code: gm.credentials.code,
      playerName: "Outro"
    });
    const character = makeCharacter(gm.session.id, player.credentials.playerId);
    const createdState = await service.createCharacter(
      gm.credentials.code,
      player.credentials.playerId,
      player.credentials.token,
      character
    );
    const createdCharacter = Object.values(createdState.characters)[0];

    await assert.rejects(
      () =>
        service.updateCharacter(
          gm.credentials.code,
          stranger.credentials.playerId,
          stranger.credentials.token,
          { ...createdCharacter, name: "Roubo" }
        ),
      /Voce nao pode editar esta ficha/
    );

    const gmEdited = await service.updateCharacter(
      gm.credentials.code,
      gm.credentials.playerId,
      gm.credentials.token,
      { ...createdCharacter, name: "Editada pelo Mestre" }
    );

    assert.equal(gmEdited.characters[createdCharacter.id].name, "Editada pelo Mestre");
  });

  it("persists sessions in the same JSON database file", async () => {
    const dir = await mkdtemp(join(tmpdir(), "faroeste-lowdb-"));
    const file = join(dir, "db.json");
    const serviceA = new SessionService(file);
    const created = await serviceA.createSession({ playerName: "Mestre" });
    const serviceB = new SessionService(file);
    const state = await serviceB.getState(
      created.credentials.code,
      created.credentials.playerId,
      created.credentials.token
    );

    assert.equal(state.code, created.credentials.code);
    assert.equal(state.players[created.credentials.playerId].name, "Mestre");
  });
});

async function makeService() {
  const dir = await mkdtemp(join(tmpdir(), "faroeste-session-"));
  return new SessionService(join(dir, "db.json"));
}

function makeCharacter(sessionId: string, ownerPlayerId: string): OnlineCharacter {
  const now = new Date().toISOString();

  return {
    id: "char-test",
    sessionId,
    ownerPlayerId,
    name: "Rosa",
    age: "31",
    originId: "origem",
    originName: "Origem",
    professionId: "profissao",
    professionName: "Profissao",
    appearance: "",
    personality: "",
    history: "",
    objective: "",
    attributes: {
      forca: 1,
      destreza: 2,
      constituicao: 1,
      inteligencia: 1,
      sorte: 1
    },
    derived: {
      maxHealth: 12,
      maxEnergy: 8,
      defense: 9
    },
    currentHealth: 12,
    currentEnergy: 8,
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
