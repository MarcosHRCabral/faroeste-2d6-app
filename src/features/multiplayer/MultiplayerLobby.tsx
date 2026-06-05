import { useState } from "react";
import { LogIn, Plus, WifiOff } from "lucide-react";
import { useMultiplayer } from "./MultiplayerContext";

export default function MultiplayerLobby({ initialCode = "" }: { initialCode?: string }) {
  const { socketReady, socketUrl, status, error, createSession, joinSession } = useMultiplayer();
  const [playerName, setPlayerName] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [code, setCode] = useState(initialCode);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"gm" | "player">("player");

  return (
    <section className="multiplayer-lobby parchment">
      <div>
        <p className="eyebrow">Mesa online</p>
        <h1>Sessao privada em tempo real</h1>
        <p className="muted">
          Crie uma sala como Mestre ou entre com o codigo recebido. As rolagens online sao feitas
          pelo servidor.
        </p>
      </div>

      {!socketReady ? (
        <div className="warning-list">
          <p>
            Configure <strong>VITE_SOCKET_URL</strong> para conectar ao backend Socket.IO.
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="warning-list" role="alert">
          <p>{error}</p>
        </div>
      ) : null}

      <div className="connection-strip">
        <span className={`status-dot ${status}`} />
        <span>{status === "connected" ? "Conectado" : status === "reconnecting" ? "Reconectando" : "Desconectado"}</span>
        <small>{socketUrl || "sem backend configurado"}</small>
      </div>

      <div className="lobby-grid">
        <form
          className="lobby-card"
          onSubmit={(event) => {
            event.preventDefault();
            createSession({
              playerName,
              sessionName,
              password
            });
          }}
        >
          <h2>Criar sessao</h2>
          <label>
            Seu nome
            <input value={playerName} onChange={(event) => setPlayerName(event.target.value)} required />
          </label>
          <label>
            Nome da sessao
            <input
              value={sessionName}
              onChange={(event) => setSessionName(event.target.value)}
              placeholder="Ex.: A poeira de Santa Esperanca"
            />
          </label>
          <label>
            Senha da sala
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="opcional"
              type="password"
            />
          </label>
          <button className="primary-action" type="submit" disabled={!socketReady || status !== "connected"}>
            <Plus size={18} />
            Criar Sessao
          </button>
        </form>

        <form
          className="lobby-card"
          onSubmit={(event) => {
            event.preventDefault();
            joinSession({
              code,
              playerName,
              role,
              password
            });
          }}
        >
          <h2>Entrar em sessao</h2>
          <label>
            Seu nome
            <input value={playerName} onChange={(event) => setPlayerName(event.target.value)} required />
          </label>
          <label>
            Codigo da sala
            <input
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="AB7K9Q"
              required
            />
          </label>
          <label>
            Senha da sala
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="se houver"
              type="password"
            />
          </label>
          <fieldset className="segmented-field">
            <legend>Entrar como</legend>
            <label>
              <input
                type="radio"
                name="role"
                value="player"
                checked={role === "player"}
                onChange={() => setRole("player")}
              />
              Jogador
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="gm"
                checked={role === "gm"}
                onChange={() => setRole("gm")}
              />
              Mestre
            </label>
          </fieldset>
          <button type="submit" disabled={!socketReady || status !== "connected"}>
            <LogIn size={18} />
            Entrar com codigo
          </button>
        </form>
      </div>

      {!socketReady || status !== "connected" ? (
        <p className="muted connection-help">
          <WifiOff size={16} />
          Para testar localmente, rode tambem <code>npm run dev:server</code>.
        </p>
      ) : null}
    </section>
  );
}
