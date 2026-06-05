import { useEffect, useMemo, useState } from "react";
import { Copy, LogOut, Plus, Users } from "lucide-react";
import type { OnlineCharacter } from "../../../shared/session";
import type { Character, Difficulty, ModifierBreakdown } from "../../types";
import CharacterCreator from "../../components/CharacterCreator";
import CharacterSheet from "../../components/CharacterSheet";
import { defaultDifficulty } from "../../logic/dice";
import { useMultiplayer } from "./MultiplayerContext";
import GmPanel from "./GmPanel";
import SessionChat from "./SessionChat";
import SessionRollHistory from "./SessionRollHistory";
import { toRollResult } from "./rollMapper";

export default function MultiplayerTable() {
  const {
    session,
    credentials,
    me,
    status,
    error,
    updatePlayer,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    rollDice,
    sendChatMessage,
    updateGmSettings,
    kickPlayer,
    endSession,
    leaveSession
  } = useMultiplayer();
  const [selectedCharacterId, setSelectedCharacterId] = useState("");
  const [showCreator, setShowCreator] = useState(false);
  const [playerName, setPlayerName] = useState(credentials?.playerName ?? "");
  const [difficulty, setDifficulty] = useState<Difficulty>(defaultDifficulty);

  const characters = useMemo(() => Object.values(session?.characters ?? {}), [session?.characters]);
  const visibleCharacters = useMemo(() => {
    if (!session || !me) {
      return [];
    }

    if (me.role === "gm" || session.settings.allowPlayersToViewOtherSheets) {
      return characters;
    }

    return characters.filter((character) => character.ownerPlayerId === me.id);
  }, [characters, me, session]);
  const selectedCharacter =
    visibleCharacters.find((character) => character.id === selectedCharacterId) ?? visibleCharacters[0];
  const latestRoll = toRollResult(session?.rollHistory[session.rollHistory.length - 1]);

  useEffect(() => {
    if (!selectedCharacterId && visibleCharacters[0]) {
      setSelectedCharacterId(visibleCharacters[0].id);
    }
  }, [selectedCharacterId, visibleCharacters]);

  if (!session || !credentials || !me) {
    return null;
  }

  const currentSession = session;
  const currentPlayer = me;
  const inviteLink = buildInviteLink(currentSession.code);
  const canEditSelected =
    selectedCharacter &&
    (currentPlayer.role === "gm" ||
      (selectedCharacter.ownerPlayerId === currentPlayer.id &&
        currentSession.settings.allowPlayersToEditAfterCreation));

  function handleCreateCharacter(character: Character) {
    createCharacter(toOnlineCharacter(character, currentSession.id, currentPlayer.id));
    setShowCreator(false);
  }

  function handleUpdateCharacter(character: Character) {
    if (!selectedCharacter || !canEditSelected) {
      return;
    }

    updateCharacter({
      ...selectedCharacter,
      ...character,
      sessionId: currentSession.id,
      ownerPlayerId: selectedCharacter.ownerPlayerId
    });
  }

  function handleRoll(source: string, modifiers: ModifierBreakdown[], rollDifficulty = difficulty) {
    rollDice({
      characterId: selectedCharacter?.id,
      rollType: "character",
      label: source,
      modifier: modifiers.reduce((total, modifier) => total + modifier.value, 0),
      difficulty: rollDifficulty
    });
  }

  function handleOpposedRoll(
    source: string,
    modifiers: ModifierBreakdown[],
    opponentLabel: string,
    opponentModifiers: ModifierBreakdown[]
  ) {
    const actorModifier = modifiers.reduce((total, modifier) => total + modifier.value, 0);
    const opponentModifier = opponentModifiers.reduce((total, modifier) => total + modifier.value, 0);

    rollDice({
      characterId: selectedCharacter?.id,
      rollType: "opposed",
      label: `${source} contra ${opponentLabel}`,
      modifier: actorModifier - opponentModifier
    });
  }

  return (
    <section className="online-table">
      <header className="session-topbar parchment">
        <div>
          <p className="eyebrow">Sessao online</p>
          <h1>{currentSession.name}</h1>
          <div className="session-code-row">
            <strong>{currentSession.code}</strong>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(inviteLink)}
              title="Copiar convite"
            >
              <Copy size={16} />
              Convite
            </button>
            <span className={`status-dot ${status}`} />
            <span>{status}</span>
          </div>
        </div>
        <button type="button" onClick={leaveSession}>
          <LogOut size={16} />
          Sair
        </button>
      </header>

      {error ? (
        <div className="warning-list" role="alert">
          <p>{error}</p>
        </div>
      ) : null}

      <div className="online-layout">
        <aside className="online-sidebar">
          <section className="tool-panel">
            <div className="panel-heading">
              <Users size={18} />
              <h2>Jogadores</h2>
            </div>
            <form
              className="player-name-form"
              onSubmit={(event) => {
                event.preventDefault();
                updatePlayer(playerName);
              }}
            >
              <input value={playerName} onChange={(event) => setPlayerName(event.target.value)} />
              <button type="submit">Salvar</button>
            </form>
            <ul className="player-list">
              {Object.values(currentSession.players).map((player) => (
                <li key={player.id}>
                  <span className={`status-dot ${player.connected ? "connected" : "disconnected"}`} />
                  <strong>{player.name}</strong>
                  <small>{player.role === "gm" ? "Mestre" : "Jogador"}</small>
                </li>
              ))}
            </ul>
          </section>

          <section className="tool-panel">
            <div className="panel-heading">
              <h2>Fichas</h2>
              <button type="button" onClick={() => setShowCreator(true)}>
                <Plus size={16} />
                Criar
              </button>
            </div>
            <div className="character-list">
              {visibleCharacters.length ? (
                visibleCharacters.map((character) => {
                  const owner = currentSession.players[character.ownerPlayerId];
                  return (
                    <button
                      key={character.id}
                      type="button"
                      className={character.id === selectedCharacter?.id ? "active" : ""}
                      onClick={() => {
                        setSelectedCharacterId(character.id);
                        setShowCreator(false);
                      }}
                    >
                      <strong>{character.name}</strong>
                      <span>{owner?.name || "sem dono"}</span>
                    </button>
                  );
                })
              ) : (
                <p className="muted">Nenhuma ficha visivel ainda.</p>
              )}
            </div>
          </section>
        </aside>

        <main className="online-main">
          {showCreator ? (
            <CharacterCreator onCreate={handleCreateCharacter} />
          ) : selectedCharacter ? (
            <>
              <CharacterSheet
                character={selectedCharacter}
                difficulty={difficulty}
                latestRoll={latestRoll}
                readOnly={!canEditSelected}
                readOnlyReason="Voce pode consultar esta ficha, mas nao edita-la."
                onDifficultyChange={setDifficulty}
                onChange={handleUpdateCharacter}
                onRoll={handleRoll}
                onOpposedRoll={handleOpposedRoll}
              />
              {canEditSelected ? (
                <button
                  type="button"
                  className="danger delete-character-button"
                  onClick={() =>
                    window.confirm("Apagar esta ficha da sessao?") && deleteCharacter(selectedCharacter.id)
                  }
                >
                  Apagar ficha da sessao
                </button>
              ) : null}
              <p className="muted edit-stamp">
                Atualizada em {new Date(selectedCharacter.updatedAt).toLocaleString("pt-BR")}
                {selectedCharacter.lastEditedByName ? ` por ${selectedCharacter.lastEditedByName}` : ""}.
              </p>
            </>
          ) : (
            <div className="empty-state">
              <h1>Nenhuma ficha selecionada</h1>
              <p>Crie sua ficha para comecar a mesa online.</p>
              <button className="primary-action" type="button" onClick={() => setShowCreator(true)}>
                <Plus size={18} />
                Criar ficha
              </button>
            </div>
          )}
        </main>

        <aside className="online-tools">
          <SessionRollHistory rolls={session.rollHistory} />
          <SessionChat
            enabled={currentSession.settings.enableChat}
            messages={currentSession.chatMessages}
            onSend={sendChatMessage}
          />
          {currentPlayer.role === "gm" ? (
            <GmPanel
              session={currentSession}
              currentPlayerId={currentPlayer.id}
              onUpdate={(settings, sessionName) => updateGmSettings({ settings, sessionName })}
              onKick={kickPlayer}
              onEnd={endSession}
            />
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function toOnlineCharacter(character: Character, sessionId: string, ownerPlayerId: string): OnlineCharacter {
  return {
    ...character,
    sessionId,
    ownerPlayerId
  };
}

function buildInviteLink(code: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const prefix = base && base !== "/" ? base : "";
  return `${window.location.origin}${prefix}/session/${code}`;
}
