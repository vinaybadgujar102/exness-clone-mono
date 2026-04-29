import WebSocket from "ws";

import { constants } from "./constants";
import { transform } from "./utils";
import { current_price } from "./inMemoryStore";
import { EVENT_KINDS, QUEUES } from "@repo/types";
import { publisher } from "@repo/redis";

const wsconnection = new WebSocket(constants.BACKPACK_URL);

const subscribe = {
  method: "SUBSCRIBE",
  params: ["bookTicker.BTC_USDC", "bookTicker.ETH_USDC"],
  id: 2,
};

wsconnection.on("open", () => {
  wsconnection.send(JSON.stringify(subscribe));
});

wsconnection.on("message", (data) => {
  const recievedData = JSON.parse(data.toString());
  const transformedData = transform(recievedData.data);

  current_price[transformedData.ticket] = {
    ...current_price[transformedData.ticket],
    price: transformedData.price,
  };
});

setInterval(async () => {
  console.log(current_price);
  await publisher.XADD(QUEUES.SEND_STREAM, "*", {
    data: JSON.stringify({
      kind: EVENT_KINDS.PRICE_TICK,
      payload: current_price,
    }),
  });
}, 5000);
