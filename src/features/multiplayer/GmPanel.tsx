import type { PublicSessionState, SessionSettings } from "../../../shared/session";

interface GmPanelProps {
  session: PublicSessionState;
  currentPlayerId: string;
  onUpdate: (settings: Partial<SessionSettings>, sessionName?: string) => void;
  onKick: (playerId: string) => void;
  onEnd: () => void;
}

export default function GmPanel({ session, currentPlayerId, onUpdate, onKick, onEnd }: GmPanelProps) {
  return (
    <section className="tool-panel gm-panel">
      <h2>Painel do Mestre</h2>
      <label>
        Nome da sessao
        <input
          value={session.name}
          onChange={(event) => onUpdate({}, event.target.value)}
        />
      </label>
      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={session.settings.allowPlayersToViewOtherSheets}
          onChange={(event) => onUpdate({ allowPlayersToViewOtherSheets: event.target.checked })}
        />
        Jogadores veem fichas alheias
      </label>
      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={session.settings.allowPlayersToEditAfterCreation}
          onChange={(event) => onUpdate({ allowPlayersToEditAfterCreation: event.target.checked })}
        />
        Jogadores editam ficha propria
      </label>
      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={session.settings.showRollsToEveryone}
          onChange={(event) => onUpdate({ showRollsToEveryone: event.target.checked })}
        />
        Mostrar rolagens para todos
      </label>
      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={session.settings.enableChat}
          onChange={(event) => onUpdate({ enableChat: event.target.checked })}
        />
        Chat habilitado
      </label>

      <h3>Jogadores</h3>
      <div className="gm-player-actions">
        {Object.values(session.players)
          .filter((player) => player.id !== currentPlayerId)
          .map((player) => (
            <button key={player.id} type="button" onClick={() => onKick(player.id)}>
              Expulsar {player.name}
            </button>
          ))}
      </div>

      <button
        type="button"
        className="danger"
        onClick={() => window.confirm("Encerrar esta sessao para todos?") && onEnd()}
      >
        Encerrar sessao
      </button>
    </section>
  );
}
