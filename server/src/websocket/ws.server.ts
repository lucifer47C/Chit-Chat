import { WebSocketServer } from "ws";
import { verifyWsToken } from "../middleware/websocketAuth";
import { clients } from "./ws.events";
import { Server } from "http";

export function initWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    const token = new URL(req.url!, "http://x").searchParams.get("token");
    if (!token) return ws.close();

    const userId = verifyWsToken(token);
    if (!userId) {
        return ws.close();
    }
    clients.set(userId, ws);

    ws.on("message", data => {
      const msg = JSON.parse(data.toString());
      const target = clients.get(msg.to);
      if (target) target.send(JSON.stringify(msg));
    });

    ws.on("close", () => clients.delete(userId));
  });
}
