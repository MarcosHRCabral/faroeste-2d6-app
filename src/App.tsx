import { useEffect, useMemo, useState } from "react";
import { Plus, ScrollText } from "lucide-react";
import CharacterCreator from "./components/CharacterCreator";
import CharacterSheet from "./components/CharacterSheet";
import SaveLoadPanel from "./components/SaveLoadPanel";
import RollHistory from "./components/RollHistory";
import {
  duplicateCharacter,
  refreshCharacter,
  validateImportedCharacter
} from "./logic/character";
import { defaultDifficulty, roll2d6, rollOpposed } from "./logic/dice";
import {
  loadActiveCharacterId,
  loadCharacters,
  parseImportedCharacters,
  saveActiveCharacterId,
  saveCharacters
} from "./logic/storage";
import type { Character, Difficulty, ModifierBreakdown, RollResult } from "./types";

type AppMode = "creator" | "sheet";

const HISTORY_LIMIT = 50;

export default function App() {
  const [characters, setCharacters] = useState<Character[]>(() => loadCharacters());
  const [activeId, setActiveId] = useState<string | null>(() => loadActiveCharacterId());
  const [mode, setMode] = useState<AppMode>(() => (loadCharacters().length ? "sheet" : "creator"));
  const [difficulty, setDifficulty] = useState<Difficulty>(defaultDifficulty);
  const [rollHistoryByCharacter, setRollHistoryByCharacter] = useState<Record<string, RollResult[]>>(
    {}
  );
  const [toast, setToast] = useState("");

  const activeCharacter = useMemo(
    () => characters.find((character) => character.id === activeId) ?? characters[0],
    [activeId, characters]
  );

  useEffect(() => {
    saveCharacters(characters);
  }, [characters]);

  useEffect(() => {
    saveActiveCharacterId(activeCharacter?.id ?? null);
  }, [activeCharacter?.id]);

  useEffect(() => {
    if (!activeId && activeCharacter) {
      setActiveId(activeCharacter.id);
    }
  }, [activeCharacter, activeId]);

  const activeHistory = activeCharacter ? rollHistoryByCharacter[activeCharacter.id] ?? [] : [];
  const latestRoll = activeHistory[0];

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function upsertCharacter(character: Character) {
    const refreshed = refreshCharacter(character);

    setCharacters((current) => {
      const exists = current.some((item) => item.id === refreshed.id);
      return exists
        ? current.map((item) => (item.id === refreshed.id ? refreshed : item))
        : [refreshed, ...current];
    });
    setActiveId(refreshed.id);
    setMode("sheet");
  }

  function addRoll(result: RollResult) {
    if (!activeCharacter) {
      return;
    }

    setRollHistoryByCharacter((current) => ({
      ...current,
      [activeCharacter.id]: [result, ...(current[activeCharacter.id] ?? [])].slice(0, HISTORY_LIMIT)
    }));
  }

  function handleRoll(source: string, modifiers: ModifierBreakdown[], rollDifficulty = difficulty) {
    addRoll(roll2d6(source, modifiers, rollDifficulty));
  }

  function handleOpposedRoll(
    source: string,
    modifiers: ModifierBreakdown[],
    opponentLabel: string,
    opponentModifiers: ModifierBreakdown[]
  ) {
    addRoll(rollOpposed(source, modifiers, opponentLabel, opponentModifiers));
  }

  function handleDuplicate() {
    if (!activeCharacter) {
      return;
    }

    const copy = duplicateCharacter(activeCharacter);
    setCharacters((current) => [copy, ...current]);
    setActiveId(copy.id);
    setMode("sheet");
    notify("Ficha duplicada.");
  }

  function handleDelete(id: string) {
    const nextCharacters = characters.filter((character) => character.id !== id);
    setCharacters(nextCharacters);
    setActiveId(nextCharacters[0]?.id ?? null);
    setMode(nextCharacters.length ? "sheet" : "creator");
    notify("Ficha removida.");
  }

  function handleImport(raw: string) {
    try {
      const imported = parseImportedCharacters(raw);

      if (!imported.length) {
        notify("JSON sem ficha valida.");
        return;
      }

      const safeImported = imported.map((character) => ({
        ...validateImportedCharacter(character)!,
        id: characters.some((existing) => existing.id === character.id) ? `${character.id}-import` : character.id
      }));
      setCharacters((current) => [...safeImported, ...current]);
      setActiveId(safeImported[0].id);
      setMode("sheet");
      notify(`${safeImported.length} ficha(s) importada(s).`);
    } catch {
      notify("Nao foi possivel ler esse JSON.");
    }
  }

  function clearHistory() {
    if (!activeCharacter) {
      return;
    }

    setRollHistoryByCharacter((current) => ({
      ...current,
      [activeCharacter.id]: []
    }));
  }

  return (
    <div className="app-shell">
      <header className="topbar no-print">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <ScrollText size={24} />
          </span>
          <div>
            <p>Faroeste +2D6</p>
            <span>Ficha, criador e rolagens para mesa</span>
          </div>
        </div>

        <button className="primary-action" type="button" onClick={() => setMode("creator")}>
          <Plus size={18} />
          Nova ficha
        </button>
      </header>

      <main className="layout">
        <aside className="sidebar no-print">
          <SaveLoadPanel
            characters={characters}
            activeId={activeCharacter?.id ?? null}
            onLoad={(id) => {
              setActiveId(id);
              setMode("sheet");
            }}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onExport={() => activeCharacter}
            onImport={handleImport}
            onPrint={() => window.print()}
          />
          <RollHistory history={activeHistory} onClear={clearHistory} />
        </aside>

        <section className="main-stage">
          {toast ? <div className="toast no-print">{toast}</div> : null}

          {mode === "creator" ? (
            <CharacterCreator onCreate={upsertCharacter} />
          ) : activeCharacter ? (
            <CharacterSheet
              character={activeCharacter}
              difficulty={difficulty}
              latestRoll={latestRoll}
              onDifficultyChange={setDifficulty}
              onChange={upsertCharacter}
              onRoll={handleRoll}
              onOpposedRoll={handleOpposedRoll}
            />
          ) : (
            <div className="empty-state">
              <h1>Nenhuma ficha ainda</h1>
              <p>Crie uma personagem para comecar a jogar.</p>
              <button className="primary-action" type="button" onClick={() => setMode("creator")}>
                <Plus size={18} />
                Criar ficha
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
