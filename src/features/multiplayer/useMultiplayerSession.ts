import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  AuthPayload,
  CharacterPayload,
  ChatMessagePayload,
  CreateSessionPayload,
  GmPlayerActionPayload,
  GmSettingsPayload,
  JoinSessionPayload,
  OnlineCharacter,
  PublicSessionState,
  RollDicePayload,
  SessionCredentials,
  SessionError,
  UpdatePlayerPayload
} from "../../../shared/session";
import { clearStoredCredentials, loadStoredCredentials, saveStoredCredentials } from "./multiplayerStorage";
import { setLocalPath, setSessionPath } from "./routes";
import { useSocketConnection } from "./useSocketConnection";

export function useMultiplayerSession(initialCode = "") {
  const { socket, socketUrl, status } = useSocketConnection();
  const [session, setSession] = useState<PublicSessionState | null>(null);
  const [credentials, setCredentials] = useState<SessionCredentials | null>(() =>
    loadStoredCredentials(initialCode || undefined)
  );
  const [error, setError] = useState("");

  const authPayload = useMemo<AuthPayload | null>(() => {
    if (!credentials) {
      return null;
    }

    return {
      code: credentials.code,
      playerId: credentials.playerId,
      token: credentials.token
    };
  }, [credentials]);

  useEffect(() => {
    if (!socket) {
      return undefined;
    }

    const handleCreated = (result: { credentials: SessionCredentials; session: PublicSessionState }) => {
      setCredentials(result.credentials);
      saveStoredCredentials(result.credentials);
      setSession(result.session);
      setSessionPath(result.credentials.code);
      setError("");
    };
    const handleJoined = (result: { credentials: SessionCredentials; session: PublicSessionState }) => {
      setCredentials(result.credentials);
      saveStoredCredentials(result.credentials);
      setSession(result.session);
      setSessionPath(result.credentials.code);
      setError("");
    };
    const handleState = (state: PublicSessionState) => setSession(state);
    const handleError = (sessionError: SessionError) => setError(sessionError.message);

    socket.on("session_created", handleCreated);
    socket.on("session_joined", handleJoined);
    socket.on("session_state", handleState);
    socket.on("session_error", handleError);

    return () => {
      socket.off("session_created", handleCreated);
      socket.off("session_joined", handleJoined);
      socket.off("session_state", handleState);
      socket.off("session_error", handleError);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !credentials || status !== "connected") {
      return;
    }

    const payload: JoinSessionPayload = {
      code: credentials.code,
      playerName: credentials.playerName,
      playerId: credentials.playerId,
      token: credentials.token
    };
    socket.emit("join_session", payload);
  }, [socket, status, credentials]);

  const createSession = useCallback(
    (payload: CreateSessionPayload) => {
      socket?.emit("create_session", payload);
    },
    [socket]
  );

  const joinSession = useCallback(
    (payload: JoinSessionPayload) => {
      socket?.emit("join_session", payload);
    },
    [socket]
  );

  const updatePlayer = useCallback(
    (name: string) => {
      if (!authPayload) {
        return;
      }

      socket?.emit("update_player", { ...authPayload, name } satisfies UpdatePlayerPayload);
    },
    [authPayload, socket]
  );

  const createCharacter = useCallback(
    (character: OnlineCharacter) => {
      if (!authPayload) {
        return;
      }

      socket?.emit("create_character", { ...authPayload, character } satisfies CharacterPayload);
    },
    [authPayload, socket]
  );

  const updateCharacter = useCallback(
    (character: OnlineCharacter) => {
      if (!authPayload) {
        return;
      }

      socket?.emit("update_character", { ...authPayload, character } satisfies CharacterPayload);
    },
    [authPayload, socket]
  );

  const deleteCharacter = useCallback(
    (characterId: string) => {
      if (!authPayload) {
        return;
      }

      socket?.emit("delete_character", { ...authPayload, characterId });
    },
    [authPayload, socket]
  );

  const rollDice = useCallback(
    (payload: Omit<RollDicePayload, keyof AuthPayload>) => {
      if (!authPayload) {
        return;
      }

      socket?.emit("roll_dice", { ...authPayload, ...payload } satisfies RollDicePayload);
    },
    [authPayload, socket]
  );

  const sendChatMessage = useCallback(
    (message: string) => {
      if (!authPayload) {
        return;
      }

      socket?.emit("send_chat_message", { ...authPayload, message } satisfies ChatMessagePayload);
    },
    [authPayload, socket]
  );

  const updateGmSettings = useCallback(
    (payload: Omit<GmSettingsPayload, keyof AuthPayload>) => {
      if (!authPayload) {
        return;
      }

      socket?.emit("gm_update_settings", { ...authPayload, ...payload } satisfies GmSettingsPayload);
    },
    [authPayload, socket]
  );

  const kickPlayer = useCallback(
    (targetPlayerId: string) => {
      if (!authPayload) {
        return;
      }

      socket?.emit("gm_kick_player", { ...authPayload, targetPlayerId } satisfies GmPlayerActionPayload);
    },
    [authPayload, socket]
  );

  const endSession = useCallback(() => {
    if (!authPayload) {
      return;
    }

    socket?.emit("gm_end_session", authPayload);
  }, [authPayload, socket]);

  const leaveSession = useCallback(() => {
    if (authPayload) {
      socket?.emit("leave_session", authPayload);
    }

    clearStoredCredentials();
    setCredentials(null);
    setSession(null);
    setLocalPath();
  }, [authPayload, socket]);

  return {
    socketReady: Boolean(socket),
    socketUrl,
    status,
    session,
    credentials,
    me: credentials && session ? session.players[credentials.playerId] : null,
    error,
    setError,
    createSession,
    joinSession,
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
