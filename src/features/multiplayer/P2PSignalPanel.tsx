import { useState } from "react";
import { Copy, Download, Save, Upload } from "lucide-react";
import { useMultiplayer } from "./MultiplayerContext";

export default function P2PSignalPanel() {
  const {
    mode,
    status,
    error,
    p2p,
    createP2POffer,
    acceptP2PAnswer,
    saveSnapshot,
    exportSessionJson,
    importSessionJson
  } = useMultiplayer();
  const [snapshotText, setSnapshotText] = useState("");

  if (mode !== "p2p-host" && mode !== "p2p-client") {
    return null;
  }

  return (
    <section className="tool-panel p2p-signal-panel">
      <div>
        <p className="eyebrow">WebRTC P2P</p>
        <h2>{mode === "p2p-host" ? "Conexao dos jogadores" : "Conexao com o Mestre"}</h2>
        <p className="muted">
          Sem backend central. O host precisa manter esta aba aberta enquanto a mesa estiver acontecendo.
        </p>
      </div>

      <div className="connection-strip">
        <span className={`status-dot ${status}`} />
        <span>{status}</span>
      </div>

      {error ? (
        <div className="warning-list" role="alert">
          <p>{error}</p>
        </div>
      ) : null}

      {mode === "p2p-host" ? (
        <div className="p2p-signal-grid">
          <label>
            Offer Code para um jogador
            <textarea readOnly value={p2p.hostOfferCode} rows={6} />
          </label>
          <div className="button-row">
            <button type="button" onClick={createP2POffer}>
              Gerar novo Offer Code
            </button>
            <button type="button" onClick={() => navigator.clipboard?.writeText(p2p.hostOfferCode)}>
              <Copy size={16} />
              Copiar
            </button>
          </div>
          <label>
            Colar Answer Code do jogador
            <textarea
              value={p2p.hostAnswerCode}
              onChange={(event) => p2p.setHostAnswerCode(event.target.value)}
              rows={6}
            />
          </label>
          <button type="button" onClick={acceptP2PAnswer}>
            Aceitar jogador
          </button>
        </div>
      ) : (
        <div className="p2p-signal-grid">
          <label>
            Seu Answer Code
            <textarea readOnly value={p2p.joinAnswerCode} rows={6} />
          </label>
          <button type="button" onClick={() => navigator.clipboard?.writeText(p2p.joinAnswerCode)}>
            <Copy size={16} />
            Copiar Answer Code
          </button>
        </div>
      )}

      {mode === "p2p-host" ? (
        <div className="p2p-snapshot-tools">
          <button type="button" onClick={saveSnapshot}>
            <Save size={16} />
            Salvar snapshot local
          </button>
          <button type="button" onClick={() => setSnapshotText(exportSessionJson())}>
            <Download size={16} />
            Exportar sessao JSON
          </button>
          <label>
            Importar sessao JSON
            <textarea value={snapshotText} onChange={(event) => setSnapshotText(event.target.value)} rows={4} />
          </label>
          <button type="button" onClick={() => importSessionJson(snapshotText)}>
            <Upload size={16} />
            Importar snapshot
          </button>
        </div>
      ) : null}
    </section>
  );
}
