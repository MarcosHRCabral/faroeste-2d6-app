import type { SessionRoll } from "../../../shared/session";

export default function SessionRollHistory({ rolls }: { rolls: SessionRoll[] }) {
  return (
    <section className="tool-panel session-rolls">
      <h2>Rolagens da mesa</h2>
      {rolls.length ? (
        <ol className="history-list">
          {[...rolls].reverse().map((roll) => (
            <li key={roll.id}>
              <div>
                <strong>{roll.label}</strong>
                <span>{new Date(roll.createdAt).toLocaleTimeString("pt-BR")}</span>
              </div>
              <p>
                {roll.playerName}
                {roll.characterName ? ` (${roll.characterName})` : ""}: {roll.dice[0]} +{" "}
                {roll.dice[1]} + {roll.modifier} = <strong>{roll.total}</strong>
              </p>
              {roll.difficulty ? (
                <small>
                  CD {roll.difficulty.target} ({roll.difficulty.label})
                </small>
              ) : null}
              <em className={`result-pill ${roll.success === false ? "failure" : "success"}`}>
                {roll.criticalType === "success"
                  ? "critico"
                  : roll.criticalType === "failure"
                    ? "falha critica"
                    : roll.success === undefined
                      ? "rolado"
                      : roll.success
                        ? "passou"
                        : "falhou"}
              </em>
            </li>
          ))}
        </ol>
      ) : (
        <p className="muted">As rolagens oficiais da sessao aparecem aqui.</p>
      )}
    </section>
  );
}
