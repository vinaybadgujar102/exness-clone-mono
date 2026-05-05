import { EVENT_KINDS } from "@repo/types";
import { WebSocketServer, WebSocket } from "ws";
import { current_price_bid_ask } from "./inMemoryStore";

export function startWebSocketServer(port: number) {
  const wss = new WebSocketServer({ port });

  wss.on("connection", (ws) => {
    ws.on("error", (error) => {
      console.error("WebSocket error", error);
    });

    setInterval(() => {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              kind: EVENT_KINDS.BID_ASK_TICK,
              payload: current_price_bid_ask,
            }),
          );
        }
      });
    }, 1000);
  });

  return wss;
}
