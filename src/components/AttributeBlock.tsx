import { Crosshair } from "lucide-react";
import { attributeDescriptions } from "../data/attributes";
import { attributeKeys, attributeLabels } from "../types";
import type { AttributeKey, Attributes, Difficulty, ModifierBreakdown } from "../types";

interface AttributeBlockProps {
  attributes: Attributes;
  difficulty: Difficulty;
  readOnly?: boolean;
  onChange: (key: AttributeKey, value: number) => void;
  onRoll: (source: string, modifiers: ModifierBreakdown[], difficulty: Difficulty) => void;
}

export default function AttributeBlock({
  attributes,
  difficulty,
  readOnly = false,
  onChange,
  onRoll
}: AttributeBlockProps) {
  return (
    <section className="sheet-section">
      <h2>Atributos</h2>
      <div className="attribute-grid sheet-attributes">
        {attributeKeys.map((key) => (
          <label key={key} className="number-card tooltip-target" data-tooltip={attributeDescriptions[key]}>
            <span>{attributeLabels[key]}</span>
            <input
              type="number"
              value={attributes[key]}
              disabled={readOnly}
              onChange={(event) => onChange(key, Number(event.target.value))}
            />
            <button
              type="button"
              className="icon-text"
              disabled={readOnly}
              onClick={() =>
                onRoll(
                  `Teste de ${attributeLabels[key]}`,
                  [{ label: attributeLabels[key], value: attributes[key] }],
                  difficulty
                )
              }
            >
              <Crosshair size={16} />
              Rolar
            </button>
          </label>
        ))}
      </div>
    </section>
  );
}
