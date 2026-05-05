import { AssetSymbols, EVENT_KINDS } from "@repo/types";
import { WebSocketServer, WebSocket } from "ws";
import { current_price_mid } from "./inMemoryStore";

const subscriptions = new Map<string, Set<WebSocket>>();

export function startWebSocketServer(port: number) {
  const wss = new WebSocketServer({ port });

  wss.on("connection", (ws) => {
    ws.on("error", (error) => {
      console.error("WebSocket error", error);
    });

    ws.on("message", (message) => {
      const data = JSON.parse(message.toString());
      if (data.type === "SUBSCRIBE") {
        const symbol = data.symbol;

        if (!subscriptions.get(symbol)) {
          subscriptions.set(symbol, new Set());
        }

        subscriptions.get(symbol)?.add(ws);
      }

      if (data.type === "UNSUBSCRIBE") {
        const symbol = data.symbol;

        subscriptions.get(symbol)?.delete(ws);
      }
    });

    ws.on("close", () => {
      for (const sub of subscriptions.values()) {
        sub.delete(ws);
      }
    });

    setInterval(() => {
      for (const [symbol, clients] of subscriptions.entries()) {
        const price = current_price_mid[symbol as AssetSymbols];

        if (!price) continue;

        for (const client of clients) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                kind: EVENT_KINDS.BID_ASK_TICK,
                payload: {
                  symbol,
                  ...price,
                },
              }),
            );
          }
        }
      }
    }, 1000);
  });

  return wss;
}
