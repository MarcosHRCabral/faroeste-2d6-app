import { useState } from "react";
import type { ChatMessage } from "../../../shared/session";

interface SessionChatProps {
  enabled: boolean;
  messages: ChatMessage[];
  onSend: (message: string) => void;
}

export default function SessionChat({ enabled, messages, onSend }: SessionChatProps) {
  const [message, setMessage] = useState("");

  return (
    <section className="tool-panel session-chat">
      <h2>Chat da mesa</h2>
      <div className="chat-list">
        {messages.length ? (
          messages.map((item) => (
            <article key={item.id}>
              <strong>{item.playerName}</strong>
              <p>{item.message}</p>
              <small>{new Date(item.createdAt).toLocaleTimeString("pt-BR")}</small>
            </article>
          ))
        ) : (
          <p className="muted">Nenhuma mensagem ainda.</p>
        )}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSend(message);
          setMessage("");
        }}
      >
        <input
          value={message}
          disabled={!enabled}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={enabled ? "Mensagem para a mesa" : "Chat desativado"}
        />
        <button type="submit" disabled={!enabled || !message.trim()}>
          Enviar
        </button>
      </form>
    </section>
  );
}
