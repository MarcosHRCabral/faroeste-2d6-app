import { useCallback, useRef, useState } from "react";
import type {
  AuthPayload,
  GmSettingsPayload,
  OnlineCharacter,
  PublicSessionState,
  RollDicePayload,
  SessionCredentials
} from "../../../shared/session";
import type {
  CharacterIdRequestPayload,
  CharacterRequestPayload,
  ChatRequestPayload,
  P2PEventEnvelope,
  P2PMode,
  PlayerUpdatedPayload,
  RollRequestPayload,
  SessionStatePayload
} from "./p2pTypes";
import {
  addP2PPlayer,
  createP2PCharacter,
  createP2PChatMessage,
  createP2PPlayer,
  createP2PRoll,
  createP2PSession,
  deleteP2PCharacter,
  isDuplicateEvent,
  markP2PPlayerLeft,
  makeP2PEvent,
  updateP2PCharacter,
  updateP2PPlayer,
  updateP2PSettings
} from "./p2pSessionLogic";
import {
  clearP2PCredentials,
  clearP2PHostSession,
  saveP2PCredentials,
  saveP2PHostSession
} from "./p2pStorage";
import { setLocalPath } from "./routes";
import { WebrtcClientTransport } from "./transport/webrtcClientTransport";
import { WebrtcHostTransport } from "./transport/webrtcHostTransport";

export function useP2PMultiplayerSession() {
  const hostTransportRef = useRef<WebrtcHostTransport | null>(null);
  const clientTransportRef = useRef<WebrtcClientTransport | null>(null);
  const seenEventsRef = useRef(new Set<string>());
  const sessionRef = useRef<PublicSessionState | null>(null);
  const credentialsRef = useRef<SessionCredentials | null>(null);
  const modeRef = useRef<P2PMode>("menu");

  const [mode, setMode] = useState<P2PMode>("menu");
  const [status, setStatus] = useState("idle");
  const [session, setSession] = useState<PublicSessionState | null>(null);
  const [credentials, setCredentials] = useState<SessionCredentials | null>(null);
  const [error, setError] = useState("");
  const [hostOfferCode, setHostOfferCode] = useState("");
  const [hostAnswerCode, setHostAnswerCode] = useState("");
  const [joinAnswerCode, setJoinAnswerCode] = useState("");
  const [joinOfferCode, setJoinOfferCode] = useState("");

  function setP2PMode(nextMode: P2PMode) {
    modeRef.current = nextMode;
    setMode(nextMode);
  }

  function setP2PCredentials(nextCredentials: SessionCredentials | null) {
    credentialsRef.current = nextCredentials;
    setCredentials(nextCredentials);

    if (nextCredentials) {
      saveP2PCredentials(nextCredentials);
    } else {
      clearP2PCredentials();
    }
  }

  function commitSession(nextSession: PublicSessionState | null, broadcast = false) {
    sessionRef.current = nextSession;
    setSession(nextSession);

    if (nextSession && modeRef.current === "p2p-host") {
      saveP2PHostSession(nextSession);
    }

    if (nextSession && broadcast) {
      broadcastSession(nextSession);
    }
  }

  function broadcastSession(nextSession = sessionRef.current) {
    const senderId = credentialsRef.current?.playerId || "host";

    if (!nextSession) {
      return;
    }

    hostTransportRef.current?.broadcast(
      makeP2PEvent("session_state", senderId, {
        session: nextSession
      } satisfies SessionStatePayload)
    );
  }

  function sendSessionTo(playerId: string, nextSession = sessionRef.current) {
    const senderId = credentialsRef.current?.playerId || "host";

    if (!nextSession) {
      return;
    }

    hostTransportRef.current?.sendTo(
      playerId,
      makeP2PEvent("session_state", senderId, {
        session: nextSession
      } satisfies SessionStatePayload)
    );
  }

  function deny(playerId: string, message: string) {
    hostTransportRef.current?.sendTo(
      playerId,
      makeP2PEvent("permission_denied", credentialsRef.current?.playerId || "host", { message })
    );
  }

  const handleHostEvent = useCallback((event: P2PEventEnvelope) => {
    try {
      if (event.type === "transport_peer_connected") {
        const { player: playerMeta } = event.payload as {
          player: { playerId: string; playerName: string };
        };
        const player = createP2PPlayer(playerMeta.playerName, "player", playerMeta.playerId);
        const nextSession = addP2PPlayer(sessionRef.current!, player);
        commitSession(nextSession, true);
        sendSessionTo(player.id, nextSession);
        return;
      }

      if (event.type === "transport_disconnected") {
        const payload = event.payload as { playerId?: string };

        if (payload.playerId && sessionRef.current) {
          commitSession(markP2PPlayerLeft(sessionRef.current, payload.playerId), true);
        }
        return;
      }

      if (isDuplicateEvent(seenEventsRef.current, event)) {
        return;
      }

      const current = sessionRef.current;

      if (!current) {
        return;
      }

      if (event.type === "sync_request") {
        sendSessionTo(event.senderId, current);
        return;
      }

      if (event.type === "player_updated") {
        commitSession(updateP2PPlayer(current, event.senderId, event.payload as PlayerUpdatedPayload), true);
        return;
      }

      if (event.type === "character_create_request") {
        const { character } = event.payload as CharacterRequestPayload;
        commitSession(createP2PCharacter(current, event.senderId, character), true);
        return;
      }

      if (event.type === "character_update_request") {
        const { character } = event.payload as CharacterRequestPayload;
        commitSession(updateP2PCharacter(current, event.senderId, character), true);
        return;
      }

      if (event.type === "character_delete_request") {
        const { characterId } = event.payload as CharacterIdRequestPayload;
        commitSession(deleteP2PCharacter(current, event.senderId, characterId), true);
        return;
      }

      if (event.type === "roll_request") {
        const result = createP2PRoll(current, event.senderId, event.payload as RollRequestPayload);
        commitSession(result.session, true);
        hostTransportRef.current?.broadcast(makeP2PEvent("roll_result", current.gmPlayerId, result.roll));
        return;
      }

      if (event.type === "chat_message") {
        const result = createP2PChatMessage(current, event.senderId, event.payload as ChatRequestPayload);
        commitSession(result.session, true);
        hostTransportRef.current?.broadcast(makeP2PEvent("chat_message", current.gmPlayerId, result.message));
      }
    } catch (eventError) {
      const message = eventError instanceof Error ? eventError.message : "Erro no evento P2P.";
      deny(event.senderId, message);
    }
  }, []);

  const handleClientEvent = useCallback((event: P2PEventEnvelope) => {
    if (event.type === "transport_connected") {
      setStatus("connected");
      clientTransportRef.current?.send(makeP2PEvent("sync_request", credentialsRef.current?.playerId || "player", {}));
      return;
    }

    if (event.type === "transport_disconnected") {
      setStatus("disconnected");
      return;
    }

    if (event.type === "session_state" || event.type === "sync_response") {
      const { session: nextSession } = event.payload as SessionStatePayload;
      commitSession(nextSession);
      setError("");
      return;
    }

    if (event.type === "permission_denied" || event.type === "host_error") {
      const payload = event.payload as { message?: string };
      setError(payload.message || "O host recusou esta acao.");
    }
  }, []);

  const startP2PHost = useCallback(
    (playerName: string, sessionName: string) => {
      hostTransportRef.current?.disconnect();
      clientTransportRef.current?.disconnect();
      seenEventsRef.current.clear();

      const created = createP2PSession(playerName, sessionName);
      const transport = new WebrtcHostTransport();

      transport.onEvent(handleHostEvent);
      hostTransportRef.current = transport;
      setP2PMode("p2p-host");
      setStatus("connected");
      setP2PCredentials(created.credentials);
      commitSession(created.session);
      setError("");
    },
    [handleHostEvent]
  );

  const createP2POffer = useCallback(async () => {
    const current = sessionRef.current;
    const currentCredentials = credentialsRef.current;

    if (!hostTransportRef.current || !current || !currentCredentials) {
      setError("Crie a sessao P2P antes de gerar convite.");
      return;
    }

    setStatus("creating-offer");
    const result = await hostTransportRef.current.createOffer({
      sessionId: current.id,
      sessionName: current.name,
      hostId: currentCredentials.playerId,
      hostName: currentCredentials.playerName
    });

    setHostOfferCode(result.offerCode);
    setStatus("waiting-answer");
  }, []);

  const acceptP2PAnswer = useCallback(async () => {
    if (!hostAnswerCode.trim()) {
      setError("Cole o Answer Code do jogador.");
      return;
    }

    try {
      await hostTransportRef.current?.acceptAnswer(hostAnswerCode);
      setHostAnswerCode("");
      setStatus("connecting");
      setError("");
    } catch (answerError) {
      setError(answerError instanceof Error ? answerError.message : "Answer Code invalido.");
      setStatus("error");
    }
  }, [hostAnswerCode]);

  const startP2PJoin = useCallback(
    async (playerName: string, offerCode: string) => {
      clientTransportRef.current?.disconnect();
      hostTransportRef.current?.disconnect();
      seenEventsRef.current.clear();

      try {
        const transport = new WebrtcClientTransport();
        transport.onEvent(handleClientEvent);
        clientTransportRef.current = transport;
        setP2PMode("p2p-client");
        setStatus("creating-answer");
        setJoinOfferCode(offerCode);

        const result = await transport.createAnswer(offerCode, playerName);
        const nextCredentials: SessionCredentials = {
          code: result.offer.sessionId.slice(-6).toUpperCase(),
          playerId: result.player.playerId,
          token: "p2p-client",
          playerName: result.player.playerName,
          role: "player"
        };

        setP2PCredentials(nextCredentials);
        setJoinAnswerCode(result.answerCode);
        setStatus("connecting");
        setError("");
      } catch (joinError) {
        setStatus("error");
        setError(joinError instanceof Error ? joinError.message : "Offer Code invalido.");
      }
    },
    [handleClientEvent]
  );

  const sendClientEvent = useCallback((type: P2PEventEnvelope["type"], payload: unknown) => {
    const currentCredentials = credentialsRef.current;

    if (!currentCredentials) {
      return;
    }

    clientTransportRef.current?.send(makeP2PEvent(type, currentCredentials.playerId, payload));
  }, []);

  const updatePlayer = useCallback(
    (name: string) => {
      const current = sessionRef.current;
      const currentCredentials = credentialsRef.current;

      if (!current || !currentCredentials) {
        return;
      }

      if (modeRef.current === "p2p-host") {
        commitSession(updateP2PPlayer(current, currentCredentials.playerId, { name }), true);
      } else {
        sendClientEvent("player_updated", { name });
      }
    },
    [sendClientEvent]
  );

  const createCharacter = useCallback(
    (character: OnlineCharacter) => {
      const current = sessionRef.current;
      const currentCredentials = credentialsRef.current;

      if (!current || !currentCredentials) {
        return;
      }

      if (modeRef.current === "p2p-host") {
        commitSession(createP2PCharacter(current, currentCredentials.playerId, character), true);
      } else {
        sendClientEvent("character_create_request", { character } satisfies CharacterRequestPayload);
      }
    },
    [sendClientEvent]
  );

  const updateCharacter = useCallback(
    (character: OnlineCharacter) => {
      const current = sessionRef.current;
      const currentCredentials = credentialsRef.current;

      if (!current || !currentCredentials) {
        return;
      }

      if (modeRef.current === "p2p-host") {
        try {
          commitSession(updateP2PCharacter(current, currentCredentials.playerId, character), true);
        } catch (updateError) {
          setError(updateError instanceof Error ? updateError.message : "Erro ao editar ficha.");
        }
      } else {
        sendClientEvent("character_update_request", { character } satisfies CharacterRequestPayload);
      }
    },
    [sendClientEvent]
  );

  const deleteCharacter = useCallback(
    (characterId: string) => {
      const current = sessionRef.current;
      const currentCredentials = credentialsRef.current;

      if (!current || !currentCredentials) {
        return;
      }

      if (modeRef.current === "p2p-host") {
        commitSession(deleteP2PCharacter(current, currentCredentials.playerId, characterId), true);
      } else {
        sendClientEvent("character_delete_request", { characterId } satisfies CharacterIdRequestPayload);
      }
    },
    [sendClientEvent]
  );

  const rollDice = useCallback(
    (payload: Omit<RollDicePayload, keyof AuthPayload>) => {
      const current = sessionRef.current;
      const currentCredentials = credentialsRef.current;

      if (!current || !currentCredentials) {
        return;
      }

      if (modeRef.current === "p2p-host") {
        const result = createP2PRoll(current, currentCredentials.playerId, payload);
        commitSession(result.session, true);
        hostTransportRef.current?.broadcast(makeP2PEvent("roll_result", currentCredentials.playerId, result.roll));
      } else {
        sendClientEvent("roll_request", payload);
      }
    },
    [sendClientEvent]
  );

  const sendChatMessage = useCallback(
    (message: string) => {
      const current = sessionRef.current;
      const currentCredentials = credentialsRef.current;

      if (!current || !currentCredentials) {
        return;
      }

      if (modeRef.current === "p2p-host") {
        const result = createP2PChatMessage(current, currentCredentials.playerId, { message });
        commitSession(result.session, true);
        hostTransportRef.current?.broadcast(makeP2PEvent("chat_message", currentCredentials.playerId, result.message));
      } else {
        sendClientEvent("chat_message", { message } satisfies ChatRequestPayload);
      }
    },
    [sendClientEvent]
  );

  const updateGmSettings = useCallback((payload: Omit<GmSettingsPayload, keyof AuthPayload>) => {
    const current = sessionRef.current;
    const currentCredentials = credentialsRef.current;

    if (!current || !currentCredentials || modeRef.current !== "p2p-host") {
      return;
    }

    commitSession(updateP2PSettings(current, currentCredentials.playerId, payload.settings, payload.sessionName), true);
  }, []);

  const kickPlayer = useCallback((playerId: string) => {
    const current = sessionRef.current;

    if (!current || modeRef.current !== "p2p-host") {
      return;
    }

    hostTransportRef.current?.closePeer(playerId);
    commitSession(markP2PPlayerLeft(current, playerId), true);
  }, []);

  const endSession = useCallback(() => {
    hostTransportRef.current?.disconnect();
    clientTransportRef.current?.disconnect();
    clearP2PHostSession();
    clearP2PCredentials();
    commitSession(null);
    setP2PCredentials(null);
    setP2PMode("menu");
    setStatus("idle");
    setError("");
  }, []);

  const leaveSession = useCallback(() => {
    hostTransportRef.current?.disconnect();
    clientTransportRef.current?.disconnect();
    clearP2PCredentials();
    setP2PCredentials(null);
    commitSession(null);
    setP2PMode("menu");
    setStatus("idle");
    setLocalPath();
  }, []);

  const saveSnapshot = useCallback(() => {
    const current = sessionRef.current;

    if (current) {
      saveP2PHostSession(current);
    }
  }, []);

  const exportSessionJson = useCallback(() => {
    const current = sessionRef.current;
    return current ? JSON.stringify(current, null, 2) : "";
  }, []);

  const importSessionJson = useCallback(
    (json: string) => {
      const imported = JSON.parse(json) as PublicSessionState;
      const gm = imported.players[imported.gmPlayerId];

      if (!gm || !imported.id || !imported.characters) {
        throw new Error("Snapshot de sessao invalido.");
      }

      const transport = new WebrtcHostTransport();
      transport.onEvent(handleHostEvent);
      hostTransportRef.current?.disconnect();
      clientTransportRef.current?.disconnect();
      hostTransportRef.current = transport;
      setP2PMode("p2p-host");
      setStatus("connected");
      setP2PCredentials({
        code: imported.code,
        playerId: gm.id,
        token: "p2p-imported",
        playerName: gm.name,
        role: "gm"
      });
      commitSession(imported);
      saveP2PHostSession(imported);
    },
    [handleHostEvent]
  );

  return {
    mode,
    socketReady: false,
    socketConfigured: false,
    socketUrl: "",
    socketConfig: {
      isConfigured: false,
      isDevelopment: Boolean(import.meta.env.DEV),
      missingMessage: ""
    },
    connectionError: "",
    status,
    session,
    credentials,
    me: credentials && session ? session.players[credentials.playerId] : null,
    error,
    setError,
    hostOfferCode,
    hostAnswerCode,
    joinAnswerCode,
    joinOfferCode,
    setHostAnswerCode,
    startP2PHost,
    createP2POffer,
    acceptP2PAnswer,
    startP2PJoin,
    saveSnapshot,
    exportSessionJson,
    importSessionJson,
    createSession: () => undefined,
    joinSession: () => undefined,
    updatePlayer,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    rollDice,
    sendChatMessage,
    updateGmSettings,
    kickPlayer,
    endSession,
    leaveSession
  };
}
