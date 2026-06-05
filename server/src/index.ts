import http from "node:http";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { Server } from "socket.io";
import { registerSocketHandlers } from "./socket";
import { SessionService } from "./sessions/sessionService";

dotenv.config({ path: ".env.local" });
dotenv.config();

const port = Number(process.env.PORT ?? 3001);
const clientOrigins = getClientOrigins();
const app = express();

app.use(
  cors({
    origin: clientOrigins,
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
    origin: clientOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

registerSocketHandlers(io, sessionService);

server.listen(port, () => {
  console.log(`Faroeste +2D6 multiplayer server listening on ${port}`);
});

function getClientOrigins(): boolean | string[] {
  const configured = process.env.CLIENT_ORIGIN || process.env.CLIENT_URL || process.env.CORS_ORIGIN || "";

  if (configured.trim() === "*") {
    return true;
  }

  const origins = configured
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length) {
    return origins;
  }

  return [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
  ];
}
