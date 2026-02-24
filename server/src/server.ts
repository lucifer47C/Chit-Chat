// src/server.ts
import "dotenv/config"; // MUST be first to populate process.env

import express from "express";
import http from "http";
import cors from "cors";

import authRouter from "./api/auth.controller";
import { keysRouter } from "./api/keys.controller";
import { messagesRouter } from "./api/messages.controller";

import { errorHandler } from "./middleware/error.middleware";
import { initWebSocket } from "./websocket/ws.server";
import { env } from "./config/env";
import { connectDB } from "./config/db";

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// health check for platform (Railway/Fly/others)
app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/keys", keysRouter);
app.use("/api/messages", messagesRouter);

// must be last
app.use(errorHandler);

async function startServer() {
  // ensure DB is connected before handling requests
  await connectDB();

  const server = http.createServer(app);
  initWebSocket(server);

  server.listen(env.PORT, () =>
    console.log(`🚀 Server running on port ${env.PORT}`)
  );
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
