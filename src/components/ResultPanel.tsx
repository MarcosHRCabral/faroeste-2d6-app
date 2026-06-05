import { CheckCircle2, XCircle } from "lucide-react";
import type { RollResult } from "../types";

interface ResultPanelProps {
  result?: RollResult;
}

export default function ResultPanel({ result }: ResultPanelProps) {
  if (!result) {
    return (
      <section className="result-panel">
        <h2>Ultima rolagem</h2>
        <p className="muted">Role um atributo, pericia ou teste livre para ver o detalhe aqui.</p>
      </section>
    );
  }

  const outcome = result.opposed
    ? result.opposed.outcome === "win"
      ? "Venceu o teste oposto"
      : result.opposed.outcome === "tie"
        ? "Empate no teste oposto"
        : "Perdeu o teste oposto"
    : result.success
      ? "Sucesso"
      : "Falha";

  return (
    <section className={`result-panel ${result.success ? "success" : "failure"}`}>
      <div className="result-title">
        <h2>{result.source}</h2>
        {result.success ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
      </div>

      <dl className="roll-breakdown">
        <div>
          <dt>Dado 1</dt>
          <dd>{result.dice[0]}</dd>
        </div>
        <div>
          <dt>Dado 2</dt>
          <dd>{result.dice[1]}</dd>
        </div>
        <div>
          <dt>Soma</dt>
          <dd>{result.diceTotal}</dd>
        </div>
        <div>
          <dt>Bonus</dt>
          <dd>{result.totalModifier >= 0 ? `+${result.totalModifier}` : result.totalModifier}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>{result.total}</dd>
        </div>
      </dl>

      <p className="result-copy">
        {outcome}
        {result.difficulty ? ` contra CD ${result.difficulty.target}` : ""}.
        {result.critical === "success" ? " Sucesso critico." : ""}
        {result.critical === "failure" ? " Falha critica." : ""}
      </p>

      {result.modifiers.length ? (
        <p className="muted">
          {result.modifiers.map((modifier) => `${modifier.label} ${modifier.value >= 0 ? "+" : ""}${modifier.value}`).join(" | ")}
        </p>
      ) : null}

      {result.opposed ? (
        <p className="opposed-copy">
          Oponente: {result.opposed.dice[0]} + {result.opposed.dice[1]} +{" "}
          {result.opposed.totalModifier} = <strong>{result.opposed.total}</strong>
        </p>
      ) : null}
    </section>
  );
}
