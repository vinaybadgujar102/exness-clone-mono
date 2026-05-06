import { publisher, subscriber } from "@repo/redis";
import {
  ASSETSCONFIG,
  AssetSymbols,
  EVENT_KINDS,
  EventSchema,
  PUBSUB_EVENTS,
  QUEUES,
} from "@repo/types";

let lastId = "0";

while (true) {
  const response = await subscriber.XREAD(
    {
      key: QUEUES.SEND_STREAM,
      id: lastId,
    },
    { BLOCK: 0, COUNT: 1 },
  );

  if (!response && !Array.isArray(response)) {
    continue;
  }

  const message = response[0]?.messages[0];
  if (!message) continue;
  lastId = message.id;

  const raw = message.message.data;
  if (!raw) continue;

  const parsed = JSON.parse(raw);
  const data = EventSchema.parse(parsed);

  if (data.kind === EVENT_KINDS.PRICE_TICK) {
    for (const [key, value] of Object.entries(data.payload)) {
      const assetConfig = ASSETSCONFIG[key as AssetSymbols];

      const midPrice = value.price;
      const bidPrice = midPrice - assetConfig.spread;
      const askPrice = midPrice + assetConfig.spread;

      await publisher.publish(
        PUBSUB_EVENTS.TO_TRADE_ENGINE,
        JSON.stringify({
          kind: EVENT_KINDS.BID_ASK_TICK,
          payload: {
            ticker: assetConfig.symbol,
            bidPrice,
            askPrice,
          },
        }),
      );
    }
  }
}
