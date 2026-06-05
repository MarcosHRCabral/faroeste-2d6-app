import { useState } from "react";
import { Dices, Swords } from "lucide-react";
import { difficulties } from "../logic/dice";
import type { Difficulty, ModifierBreakdown } from "../types";

interface DiceRollerProps {
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onRoll: (source: string, modifiers: ModifierBreakdown[], difficulty: Difficulty) => void;
  onOpposedRoll: (
    source: string,
    modifiers: ModifierBreakdown[],
    opponentLabel: string,
    opponentModifiers: ModifierBreakdown[]
  ) => void;
}

export default function DiceRoller({
  difficulty,
  onDifficultyChange,
  onRoll,
  onOpposedRoll
}: DiceRollerProps) {
  const [freeModifier, setFreeModifier] = useState(0);
  const [opponentModifier, setOpponentModifier] = useState(0);
  const [opponentLabel, setOpponentLabel] = useState("Oponente");

  return (
    <section className="tool-panel dice-roller">
      <div className="panel-heading">
        <Dices size={18} />
        <h2>Rolador 2d6</h2>
      </div>

      <label className="field-label" htmlFor="difficulty">
        Dificuldade
      </label>
      <select
        id="difficulty"
        value={difficulty.id}
        onChange={(event) =>
          onDifficultyChange(
            difficulties.find((item) => item.id === event.target.value) ?? difficulties[1]
          )
        }
      >
        {difficulties.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label} - {item.target}
          </option>
        ))}
      </select>

      <div className="dice-actions">
        <button type="button" className="primary-action" onClick={() => onRoll("2d6 puro", [], difficulty)}>
          <Dices size={18} />
          2d6 puro
        </button>
        <label>
          Bonus livre
          <input
            type="number"
            value={freeModifier}
            onChange={(event) => setFreeModifier(Number(event.target.value))}
          />
        </label>
        <button
          type="button"
          onClick={() => onRoll("Teste livre", [{ label: "Bonus livre", value: freeModifier }], difficulty)}
        >
          <Dices size={16} />
          Rolar livre
        </button>
      </div>

      <div className="opposed-box">
        <h3>Teste oposto</h3>
        <label>
          Nome do oponente
          <input value={opponentLabel} onChange={(event) => setOpponentLabel(event.target.value)} />
        </label>
        <label>
          Bonus do oponente
          <input
            type="number"
            value={opponentModifier}
            onChange={(event) => setOpponentModifier(Number(event.target.value))}
          />
        </label>
        <button
          type="button"
          onClick={() =>
            onOpposedRoll(
              "Teste oposto",
              [{ label: "Bonus livre", value: freeModifier }],
              opponentLabel || "Oponente",
              [{ label: "Bonus do oponente", value: opponentModifier }]
            )
          }
        >
          <Swords size={16} />
          Rolar oposto
        </button>
      </div>
    </section>
  );
}
