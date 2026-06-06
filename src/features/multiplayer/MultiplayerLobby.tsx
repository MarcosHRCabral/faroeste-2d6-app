import { useState } from "react";
import { Globe2, Home, LogIn, Plus, RadioTower, WifiOff } from "lucide-react";
import { setLocalPath } from "./routes";
import { useMultiplayer } from "./MultiplayerContext";

export default function MultiplayerLobby({ initialCode = "" }: { initialCode?: string }) {
  const multiplayer = useMultiplayer();
  const {
    mode,
    socketReady,
    socketConfigured,
    socketConfig,
    socketUrl,
    status,
    connectionError,
    error,
    createSession,
    joinSession,
    startSocketMode,
    startP2PHost,
    startP2PJoin,
    p2p
  } = multiplayer;
  const [serverPlayerName, setServerPlayerName] = useState("");
  const [serverSessionName, setServerSessionName] = useState("");
  const [serverCode, setServerCode] = useState(initialCode);
  const [serverPassword, setServerPassword] = useState("");
  const [role, setRole] = useState<"gm" | "player">("player");
  const [hostName, setHostName] = useState("");
  const [hostSessionName, setHostSessionName] = useState("");
  const [joinName, setJoinName] = useState("");
  const [offerCode, setOfferCode] = useState("");

  if (mode === "socket") {
    return (
      <section className="multiplayer-lobby parchment">
        <button type="button" onClick={multiplayer.startMenu}>
          Voltar
        </button>
        <div>
          <p className="eyebrow">Online Server</p>
          <h1>Sessao via Socket.IO</h1>
          <p className="muted">Use esta opcao apenas quando um backend estiver configurado.</p>
        </div>

        {error ? (
          <div className="warning-list" role="alert">
            <p>{error}</p>
          </div>
        ) : null}

        <div className="connection-strip">
          <span className={`status-dot ${status}`} />
          <span>{getStatusLabel(status)}</span>
          {socketConfig.isDevelopment ? <small>Backend: {socketUrl || "sem backend configurado"}</small> : null}
        </div>

        {status === "error" && connectionError ? (
          <div className="warning-list" role="alert">
            <p>Erro de conexao com o backend: {connectionError}</p>
          </div>
        ) : null}

        <div className="lobby-grid">
          <form
            className="lobby-card"
            onSubmit={(event) => {
              event.preventDefault();
              createSession({
                playerName: serverPlayerName,
                sessionName: serverSessionName,
                password: serverPassword
              });
            }}
          >
            <h2>Criar sessao</h2>
            <label>
              Seu nome
              <input value={serverPlayerName} onChange={(event) => setServerPlayerName(event.target.value)} required />
            </label>
            <label>
              Nome da sessao
              <input
                value={serverSessionName}
                onChange={(event) => setServerSessionName(event.target.value)}
                placeholder="Ex.: A poeira de Santa Esperanca"
              />
            </label>
            <label>
              Senha da sala
              <input
                value={serverPassword}
                onChange={(event) => setServerPassword(event.target.value)}
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
                code: serverCode,
                playerName: serverPlayerName,
                role,
                password: serverPassword
              });
            }}
          >
            <h2>Entrar em sessao</h2>
            <label>
              Seu nome
              <input value={serverPlayerName} onChange={(event) => setServerPlayerName(event.target.value)} required />
            </label>
            <label>
              Codigo da sala
              <input
                value={serverCode}
                onChange={(event) => setServerCode(event.target.value.toUpperCase())}
                placeholder="AB7K9Q"
                required
              />
            </label>
            <label>
              Senha da sala
              <input
                value={serverPassword}
                onChange={(event) => setServerPassword(event.target.value)}
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
      </section>
    );
  }

  if (mode === "p2p-client" && p2p.joinAnswerCode) {
    return (
      <section className="multiplayer-lobby parchment">
        <button type="button" onClick={multiplayer.startMenu}>
          Voltar
        </button>
        <div>
          <p className="eyebrow">Join Game P2P</p>
          <h1>Envie o Answer Code ao Mestre</h1>
          <p className="muted">
            Quando o Mestre colar este codigo, a conexao WebRTC abre e a mesa aparece aqui.
          </p>
        </div>
        {error ? (
          <div className="warning-list" role="alert">
            <p>{error}</p>
          </div>
        ) : null}
        <div className="connection-strip">
          <span className={`status-dot ${status}`} />
          <span>{getStatusLabel(status)}</span>
        </div>
        <label>
          Answer Code
          <textarea readOnly value={p2p.joinAnswerCode} rows={8} />
        </label>
        <button type="button" onClick={() => navigator.clipboard?.writeText(p2p.joinAnswerCode)}>
          Copiar Answer Code
        </button>
      </section>
    );
  }

  return (
    <section className="multiplayer-lobby parchment">
      <div>
        <p className="eyebrow">Mesa online</p>
        <h1>Escolha como deseja jogar</h1>
        <p className="muted">
          O modo P2P funciona no GitHub Pages sem backend central. O Mestre precisa manter a aba aberta.
        </p>
      </div>

      {error ? (
        <div className="warning-list" role="alert">
          <p>{error}</p>
        </div>
      ) : null}

      <div className="lobby-grid multiplayer-choice-grid">
        <article className="lobby-card">
          <Home size={22} />
          <h2>Jogo Local</h2>
          <p className="muted">Use a ficha neste navegador, sem conexao online.</p>
          <button type="button" onClick={setLocalPath}>
            Abrir modo local
          </button>
        </article>

        <form
          className="lobby-card"
          onSubmit={(event) => {
            event.preventDefault();
            startP2PHost(hostName, hostSessionName);
          }}
        >
          <RadioTower size={22} />
          <h2>Host Game P2P</h2>
          <p className="muted">Crie uma sessao onde seu navegador sera o host.</p>
          <label>
            Nome do Mestre
            <input value={hostName} onChange={(event) => setHostName(event.target.value)} required />
          </label>
          <label>
            Nome da mesa
            <input
              value={hostSessionName}
              onChange={(event) => setHostSessionName(event.target.value)}
              placeholder="Ex.: Trilhos de Abilene"
            />
          </label>
          <button className="primary-action" type="submit">
            Criar mesa P2P
          </button>
        </form>

        <form
          className="lobby-card"
          onSubmit={(event) => {
            event.preventDefault();
            startP2PJoin(joinName, offerCode);
          }}
        >
          <LogIn size={22} />
          <h2>Join Game P2P</h2>
          <p className="muted">Entre usando o Offer Code enviado pelo Mestre.</p>
          <label>
            Seu nome
            <input value={joinName} onChange={(event) => setJoinName(event.target.value)} required />
          </label>
          <label>
            Host Offer Code
            <textarea
              value={offerCode}
              onChange={(event) => setOfferCode(event.target.value)}
              rows={5}
              required
            />
          </label>
          <button type="submit">Gerar Answer Code</button>
        </form>

        {socketConfigured ? (
          <article className="lobby-card">
            <Globe2 size={22} />
            <h2>Online Server</h2>
            <p className="muted">Use backend Socket.IO se configurado.</p>
            <button type="button" onClick={startSocketMode}>
              Usar servidor online
            </button>
          </article>
        ) : (
          <article className="lobby-card">
            <WifiOff size={22} />
            <h2>Online Server</h2>
            <p className="muted">Opcional. Configure VITE_SOCKET_URL apenas se quiser usar backend.</p>
          </article>
        )}
      </div>

      <p className="muted connection-help">
        P2P usa WebRTC com STUN publico. Pode falhar em redes restritas; se isso acontecer, use o modo
        servidor opcional.
      </p>
    </section>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    idle: "Aguardando",
    creatingOffer: "Criando convite...",
    "creating-offer": "Criando convite...",
    "waiting-answer": "Aguardando Answer Code",
    "creating-answer": "Criando resposta...",
    connecting: "Conectando...",
    connected: "Conectado",
    reconnecting: "Reconectando...",
    disconnected: "Desconectado",
    error: "Erro de conexao",
    unconfigured: "Backend nao configurado"
  };

  return labels[status] ?? "Aguardando";
}
