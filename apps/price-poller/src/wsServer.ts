import { ASSETSCONFIG, AssetSymbols, EVENT_KINDS } from "@repo/types";
import { WebSocketServer, WebSocket } from "ws";
import { current_price_bid_ask } from "./inMemoryStore";

const subscriptions = new Map<string, Set<WebSocket>>();

function bidAskTickPayload(): Record<
  AssetSymbols,
  { bid: number; ask: number; decimal: number }
> {
  const payload = {} as Record<
    AssetSymbols,
    { bid: number; ask: number; decimal: number }
  >;
  for (const sym of Object.values(AssetSymbols)) {
    const row = current_price_bid_ask[sym];
    const scale = ASSETSCONFIG[sym].priceScale;
    payload[sym] = {
      bid: row.bid / scale,
      ask: row.ask / scale,
      decimal: row.decimal,
    };
  }
  return payload;
}

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
  });

  setInterval(() => {
    const message = JSON.stringify({
      kind: EVENT_KINDS.BID_ASK_TICK,
      payload: bidAskTickPayload(),
    });

    const notified = new Set<WebSocket>();
    for (const clients of subscriptions.values()) {
      for (const client of clients) {
        if (notified.has(client)) continue;
        notified.add(client);
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      }
    }
  }, 1000);

  return wss;
}
