import WebSocket, { WebSocketServer } from "ws";

import { constants } from "./constants";
import { transform, transformToBidAsk } from "./utils";
import { current_price_bid_ask, current_price_mid } from "./inMemoryStore";
import { EVENT_KINDS, QUEUES } from "@repo/types";
import { publisher } from "@repo/redis";
import { binanceSubscribeDataSchema } from "./types";
import { startWebSocketServer } from "./wsServer";

startWebSocketServer(8080);

const wsconnection = new WebSocket(constants.BINANCE_URL);

const subscribe = {
  method: "SUBSCRIBE",
  params: ["btcusdt@aggTrade", "ethusdt@aggTrade"],
  id: 1,
};

wsconnection.on("open", () => {
  wsconnection.send(JSON.stringify(subscribe));
});

wsconnection.on("message", (data) => {
  const parsedData = JSON.parse(data.toString());
  const recievedData = binanceSubscribeDataSchema.parse(parsedData);

  if ("stream" in recievedData) {
    const transformedData = transform(recievedData.data);
    const transformedBidAskData = transformToBidAsk(recievedData.data);

    current_price_mid[transformedData.ticker] = {
      ...current_price_mid[transformedData.ticker],
      price: transformedData.price,
    };

    current_price_bid_ask[transformedBidAskData.ticker] = {
      ...current_price_bid_ask[transformedBidAskData.ticker],
      bid: transformedBidAskData.bid,
      ask: transformedBidAskData.ask,
    };
  }
});

setInterval(async () => {
  console.log("publishing price tick", current_price_mid);
  await publisher.XADD(QUEUES.SEND_STREAM, "*", {
    data: JSON.stringify({
      kind: EVENT_KINDS.PRICE_TICK,
      payload: current_price_mid,
    }),
  });
}, 1000);
