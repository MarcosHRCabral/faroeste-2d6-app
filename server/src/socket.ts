import type { Server, Socket } from "socket.io";
import type {
  AuthPayload,
  CharacterIdPayload,
  CharacterPayload,
  ChatMessagePayload,
  CreateSessionPayload,
  GmPlayerActionPayload,
  GmSettingsPayload,
  JoinSessionPayload,
  RollDicePayload,
  SessionError as WireSessionError,
  UpdatePlayerPayload
} from "../../shared/session";
import { SessionError, SessionService } from "./sessions/sessionService";

interface SocketData {
  code?: string;
  playerId?: string;
  token?: string;
}

export function registerSocketHandlers(io: Server, sessionService: SessionService): void {
  io.on("connection", (socket: Socket<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>, SocketData>) => {
    socket.on("create_session", (payload: CreateSessionPayload) =>
      safely(socket, async () => {
        const result = await sessionService.createSession(payload);
        remember(socket, result.credentials.code, result.credentials.playerId, result.credentials.token);
        await socket.join(result.credentials.code);
        socket.emit("session_created", result);
        io.to(result.credentials.code).emit("session_state", result.session);
      })
    );

    socket.on("join_session", (payload: JoinSessionPayload) =>
      safely(socket, async () => {
        const result = await sessionService.joinSession(payload);
        remember(socket, result.credentials.code, result.credentials.playerId, result.credentials.token);
        await socket.join(result.credentials.code);
        socket.emit("session_joined", result);
        socket.to(result.credentials.code).emit("player_joined", result.credentials);
        io.to(result.credentials.code).emit("session_state", result.session);
      })
    );

    socket.on("request_session_state", (payload: AuthPayload) =>
      safely(socket, async () => {
        const session = await sessionService.getState(payload.code, payload.playerId, payload.token);
        socket.emit("session_state", session);
      })
    );

    socket.on("leave_session", (payload: AuthPayload) =>
      safely(socket, async () => {
        const session = await sessionService.disconnectPlayer(payload.code, payload.playerId, payload.token);
        socket.leave(payload.code);

        if (session) {
          io.to(payload.code).emit("player_left", { playerId: payload.playerId });
          io.to(payload.code).emit("session_state", session);
        }
      })
    );

    socket.on("update_player", (payload: UpdatePlayerPayload) =>
      safely(socket, async () => {
        const session = await sessionService.updatePlayer(payload);
        io.to(payload.code).emit("player_updated", { playerId: payload.playerId });
        io.to(payload.code).emit("session_state", session);
      })
    );

    socket.on("create_character", (payload: CharacterPayload) =>
      safely(socket, async () => {
        const session = await sessionService.createCharacter(
          payload.code,
          payload.playerId,
          payload.token,
          payload.character
        );
        io.to(payload.code).emit("character_created", payload.character);
        io.to(payload.code).emit("session_state", session);
      })
    );

    socket.on("update_character", (payload: CharacterPayload) =>
      safely(socket, async () => {
        const session = await sessionService.updateCharacter(
          payload.code,
          payload.playerId,
          payload.token,
          payload.character
        );
        io.to(payload.code).emit("character_updated", payload.character);
        io.to(payload.code).emit("session_state", session);
      })
    );

    socket.on("delete_character", (payload: CharacterIdPayload) =>
      safely(socket, async () => {
        const session = await sessionService.deleteCharacter(
          payload.code,
          payload.playerId,
          payload.token,
          payload.characterId
        );
        io.to(payload.code).emit("character_deleted", { characterId: payload.characterId });
        io.to(payload.code).emit("session_state", session);
      })
    );

    socket.on("roll_dice", (payload: RollDicePayload) =>
      safely(socket, async () => {
        const result = await sessionService.rollDice({
          code: payload.code,
          playerId: payload.playerId,
          token: payload.token,
          characterId: payload.characterId,
          rollType: payload.rollType,
          label: payload.label,
          modifier: payload.modifier,
          difficulty: payload.difficulty
        });
        io.to(payload.code).emit("dice_rolled", result.roll);
        io.to(payload.code).emit("session_state", result.session);
      })
    );

    socket.on("send_chat_message", (payload: ChatMessagePayload) =>
      safely(socket, async () => {
        const result = await sessionService.sendChatMessage(
          payload.code,
          payload.playerId,
          payload.token,
          payload.message
        );
        io.to(payload.code).emit("chat_message", result.message);
        io.to(payload.code).emit("session_state", result.session);
      })
    );

    socket.on("gm_update_settings", (payload: GmSettingsPayload) =>
      safely(socket, async () => {
        const session = await sessionService.updateGmSettings(payload);
        io.to(payload.code).emit("gm_settings_updated", session.settings);
        io.to(payload.code).emit("session_state", session);
      })
    );

    socket.on("gm_kick_player", (payload: GmPlayerActionPayload) =>
      safely(socket, async () => {
        const session = await sessionService.kickPlayer(payload);
        io.to(payload.code).emit("player_kicked", { playerId: payload.targetPlayerId });
        io.to(payload.code).emit("session_state", session);
      })
    );

    socket.on("gm_end_session", (payload: AuthPayload) =>
      safely(socket, async () => {
        const session = await sessionService.endSession(payload.code, payload.playerId, payload.token);
        io.to(payload.code).emit("session_ended", session);
        io.to(payload.code).emit("session_state", session);
      })
    );

    socket.on("disconnect", () =>
      void safely(socket, async () => {
        const { code, playerId, token } = socket.data;

        if (!code || !playerId) {
          return;
        }

        const session = await sessionService.disconnectPlayer(code, playerId, token);

        if (session) {
          io.to(code).emit("player_left", { playerId });
          io.to(code).emit("session_state", session);
        }
      })
    );
  });
}

function remember(socket: Socket<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>, SocketData>, code: string, playerId: string, token: string) {
  socket.data.code = code;
  socket.data.playerId = playerId;
  socket.data.token = token;
}

async function safely(socket: Socket, action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch (error) {
    socket.emit("session_error", serializeError(error));
  }
}

function serializeError(error: unknown): WireSessionError {
  if (error instanceof SessionError) {
    return {
      code: error.code,
      message: error.message
    };
  }

  console.error(error);
  return {
    code: "internal_error",
    message: "Erro interno da sessao."
  };
}
