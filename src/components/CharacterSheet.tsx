import { Dice5, HeartPulse, Zap } from "lucide-react";
import AttributeBlock from "./AttributeBlock";
import DiceRoller from "./DiceRoller";
import EquipmentList from "./EquipmentList";
import ResultPanel from "./ResultPanel";
import SkillList from "./SkillList";
import { attributeLabels } from "../types";
import type {
  AttributeKey,
  Character,
  Difficulty,
  ModifierBreakdown,
  RollResult
} from "../types";

interface CharacterSheetProps {
  character: Character;
  difficulty: Difficulty;
  latestRoll?: RollResult;
  readOnly?: boolean;
  readOnlyReason?: string;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onChange: (character: Character) => void;
  onRoll: (source: string, modifiers: ModifierBreakdown[], difficulty: Difficulty) => void;
  onOpposedRoll: (
    source: string,
    modifiers: ModifierBreakdown[],
    opponentLabel: string,
    opponentModifiers: ModifierBreakdown[]
  ) => void;
}

function listToText(values: string[]) {
  return values.join("\n");
}

function textToList(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function CharacterSheet({
  character,
  difficulty,
  latestRoll,
  readOnly = false,
  readOnlyReason,
  onDifficultyChange,
  onChange,
  onRoll,
  onOpposedRoll
}: CharacterSheetProps) {
  function update(patch: Partial<Character>) {
    if (readOnly) {
      return;
    }

    onChange({ ...character, ...patch });
  }

  function updateAttribute(key: AttributeKey, value: number) {
    update({
      attributes: {
        ...character.attributes,
        [key]: value
      }
    });
  }

  return (
    <div className="sheet-wrap">
      <article className="character-sheet parchment">
        {readOnly ? (
          <div className="read-only-banner">
            {readOnlyReason || "Voce esta vendo esta ficha em modo leitura."}
          </div>
        ) : null}
        <header className="sheet-header">
          <div className="identity-fields">
            <label>
              Nome
              <input
                value={character.name}
                disabled={readOnly}
                onChange={(event) => update({ name: event.target.value })}
              />
            </label>
            <label>
              Idade
              <input
                value={character.age}
                disabled={readOnly}
                onChange={(event) => update({ age: event.target.value })}
              />
            </label>
            <label>
              Origem / etnia / arquetipo cultural
              <input
                value={character.originName}
                disabled={readOnly}
                onChange={(event) => update({ originName: event.target.value })}
              />
            </label>
            <label>
              Profissao
              <input
                value={character.professionName}
                disabled={readOnly}
                onChange={(event) => update({ professionName: event.target.value })}
              />
            </label>
          </div>

          <div className="vitals">
            <label>
              <HeartPulse size={18} />
              PV
              <input
                type="number"
                value={character.currentHealth}
                disabled={readOnly}
                onChange={(event) => update({ currentHealth: Number(event.target.value) })}
              />
              <span>/ {character.derived.maxHealth}</span>
            </label>
            <label>
              <Zap size={18} />
              Folego
              <input
                type="number"
                value={character.currentEnergy}
                disabled={readOnly}
                onChange={(event) => update({ currentEnergy: Number(event.target.value) })}
              />
              <span>/ {character.derived.maxEnergy}</span>
            </label>
            <div>
              Defesa <strong>{character.derived.defense}</strong>
            </div>
            <button
              type="button"
              className="icon-text"
              disabled={readOnly}
              onClick={() =>
                onRoll(
                  "Iniciativa",
                  [{ label: attributeLabels.destreza, value: character.attributes.destreza }],
                  difficulty
                )
              }
            >
              <Dice5 size={16} />
              Iniciativa
            </button>
          </div>
        </header>

        <div className="sheet-grid">
          <div className="sheet-main">
            <AttributeBlock
              attributes={character.attributes}
              difficulty={difficulty}
              readOnly={readOnly}
              onChange={updateAttribute}
              onRoll={onRoll}
            />

            <SkillList
              character={character}
              difficulty={difficulty}
              readOnly={readOnly}
              onChange={(skills) => update({ skills })}
              onRoll={onRoll}
            />

            <EquipmentList
              equipment={character.equipment}
              weapons={character.weapons}
              readOnly={readOnly}
              onEquipmentChange={(equipment) => update({ equipment })}
              onWeaponsChange={(weapons) => update({ weapons })}
            />
          </div>

          <aside className="sheet-side">
            <DiceRoller
              difficulty={difficulty}
              onDifficultyChange={onDifficultyChange}
              onRoll={onRoll}
              onOpposedRoll={onOpposedRoll}
            />
            <ResultPanel result={latestRoll} />
          </aside>
        </div>

        <section className="sheet-section">
          <h2>Perfil</h2>
          <div className="form-grid">
            <label>
              Aparencia
              <textarea
                value={character.appearance}
                disabled={readOnly}
                onChange={(event) => update({ appearance: event.target.value })}
                rows={3}
              />
            </label>
            <label>
              Personalidade
              <textarea
                value={character.personality}
                disabled={readOnly}
                onChange={(event) => update({ personality: event.target.value })}
                rows={3}
              />
            </label>
            <label>
              Historia curta
              <textarea
                value={character.history}
                disabled={readOnly}
                onChange={(event) => update({ history: event.target.value })}
                rows={4}
              />
            </label>
            <label>
              Objetivo pessoal
              <textarea
                value={character.objective}
                disabled={readOnly}
                onChange={(event) => update({ objective: event.target.value })}
                rows={4}
              />
            </label>
          </div>
        </section>

        <section className="sheet-section">
          <div className="form-grid">
            <label>
              Dinheiro
              <input
                type="number"
                value={character.money}
                disabled={readOnly}
                onChange={(event) => update({ money: Number(event.target.value) })}
              />
            </label>
            <label>
              Vantagens
              <textarea
                value={listToText(character.advantages)}
                disabled={readOnly}
                onChange={(event) => update({ advantages: textToList(event.target.value) })}
                rows={4}
              />
            </label>
            <label>
              Desvantagens
              <textarea
                value={listToText(character.disadvantages)}
                disabled={readOnly}
                onChange={(event) => update({ disadvantages: textToList(event.target.value) })}
                rows={4}
              />
            </label>
            <label>
              Resumo
              <textarea
                value={character.summary}
                disabled={readOnly}
                onChange={(event) => update({ summary: event.target.value })}
                rows={4}
              />
            </label>
            <label className="wide-field">
              Anotacoes livres
              <textarea
                value={character.notes}
                disabled={readOnly}
                onChange={(event) => update({ notes: event.target.value })}
                rows={6}
              />
            </label>
          </div>
        </section>
      </article>
    </div>
  );
}
