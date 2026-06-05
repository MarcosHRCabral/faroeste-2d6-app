import { RotateCcw } from "lucide-react";
import type { RollResult } from "../types";

interface RollHistoryProps {
  history: RollResult[];
  onClear: () => void;
}

function criticalLabel(result: RollResult) {
  if (result.critical === "success") {
    return "critico";
  }

  if (result.critical === "failure") {
    return "falha critica";
  }

  if (result.opposed) {
    return result.opposed.outcome === "win"
      ? "venceu"
      : result.opposed.outcome === "tie"
        ? "empate"
        : "perdeu";
  }

  return result.success ? "passou" : "falhou";
}

export default function RollHistory({ history, onClear }: RollHistoryProps) {
  return (
    <section className="tool-panel roll-history">
      <div className="panel-heading">
        <RotateCcw size={18} />
        <h2>Historico</h2>
        <button type="button" className="icon-button" onClick={onClear} disabled={!history.length}>
          Limpar
        </button>
      </div>

      {history.length ? (
        <ol className="history-list">
          {history.map((roll) => (
            <li key={roll.id}>
              <div>
                <strong>{roll.source}</strong>
                <span>{new Date(roll.createdAt).toLocaleTimeString("pt-BR")}</span>
              </div>
              <p>
                {roll.dice[0]} + {roll.dice[1]} + {roll.totalModifier} ={" "}
                <strong>{roll.total}</strong>
              </p>
              {roll.opposed ? (
                <small>
                  Contra {roll.opposed.label}: {roll.opposed.dice[0]} + {roll.opposed.dice[1]} +{" "}
                  {roll.opposed.totalModifier} = {roll.opposed.total}
                </small>
              ) : roll.difficulty ? (
                <small>
                  CD {roll.difficulty.target} ({roll.difficulty.label})
                </small>
              ) : null}
              <em className={`result-pill ${roll.success ? "success" : "failure"}`}>
                {criticalLabel(roll)}
              </em>
            </li>
          ))}
        </ol>
      ) : (
        <p className="muted">As rolagens da ficha ativa aparecem aqui.</p>
      )}
    </section>
  );
}
