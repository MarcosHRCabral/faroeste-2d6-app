import { Dice5 } from "lucide-react";
import { skillTemplates } from "../data/skills";
import { attributeLabels } from "../types";
import type { Character, Difficulty, ModifierBreakdown, Skill } from "../types";

interface SkillListProps {
  character: Character;
  difficulty: Difficulty;
  readOnly?: boolean;
  onChange: (skills: Skill[]) => void;
  onRoll: (source: string, modifiers: ModifierBreakdown[], difficulty: Difficulty) => void;
}

export default function SkillList({
  character,
  difficulty,
  readOnly = false,
  onChange,
  onRoll
}: SkillListProps) {
  function updateSkill(id: string, patch: Partial<Skill>) {
    onChange(character.skills.map((skill) => (skill.id === id ? { ...skill, ...patch } : skill)));
  }

  return (
    <section className="sheet-section">
      <h2>Pericias</h2>
      <div className="skill-table sheet-skill-table">
        {character.skills.map((skill) => {
          const attributeValue = character.attributes[skill.attribute] ?? 0;
          const description =
            skillTemplates.find((template) => template.id === skill.id)?.description ??
            "Pericia usada em testes de 2d6 somando atributo relacionado e bonus treinado.";

          return (
            <div key={skill.id} className="skill-row tooltip-target" data-tooltip={description}>
              <div>
                <strong>{skill.name}</strong>
                <span>
                  {attributeLabels[skill.attribute]} {attributeValue >= 0 ? "+" : ""}
                  {attributeValue}
                </span>
              </div>
              <input
                aria-label={`Bonus de ${skill.name}`}
                type="number"
                value={skill.bonus}
                disabled={readOnly}
                onChange={(event) => updateSkill(skill.id, { bonus: Number(event.target.value) })}
              />
              <input
                aria-label={`Notas de ${skill.name}`}
                value={skill.notes}
                disabled={readOnly}
                onChange={(event) => updateSkill(skill.id, { notes: event.target.value })}
                placeholder="observacoes"
              />
              <button
                type="button"
                className="icon-text"
                disabled={readOnly}
                onClick={() =>
                  onRoll(
                    skill.name,
                    [
                      { label: attributeLabels[skill.attribute], value: attributeValue },
                      { label: skill.name, value: skill.bonus }
                    ],
                    difficulty
                  )
                }
              >
                <Dice5 size={16} />
                Rolar
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
