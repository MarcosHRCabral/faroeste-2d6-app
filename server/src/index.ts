import "dotenv/config";
import http from "node:http";
import cors from "cors";
import express from "express";
import { Server } from "socket.io";
import { registerSocketHandlers } from "./socket";
import { SessionService } from "./sessions/sessionService";

const port = Number(process.env.PORT ?? 3001);
const clientOrigin = process.env.CLIENT_ORIGIN || "*";
const app = express();

app.use(
  cors({
    origin: clientOrigin === "*" ? true : clientOrigin,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));

const sessionService = new SessionService(process.env.DB_FILE);

app.get("/health", async (_request, response) => {
  response.json({
    ok: true,
    sessions: (await sessionService.listSessionCodes()).length
  });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: clientOrigin === "*" ? true : clientOrigin,
    credentials: true
  }
});

registerSocketHandlers(io, sessionService);

server.listen(port, () => {
  console.log(`Faroeste +2D6 multiplayer server listening on ${port}`);
});
