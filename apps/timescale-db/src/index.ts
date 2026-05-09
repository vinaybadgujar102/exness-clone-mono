import { subscriber } from "@repo/redis";
import {
  AssetSymbols,
  EVENT_KINDS,
  EventSchema,
  PUBSUB_EVENTS,
} from "@repo/types";
import {
  createFiveMinCandles,
  createOneMinCandles,
  initDB,
  insertTick,
} from "./dbUtils";

await initDB();
await createOneMinCandles();
await createFiveMinCandles();

try {
  await subscriber.subscribe(PUBSUB_EVENTS.PRICE_CHANNEL, async (message) => {
    const parsed = JSON.parse(message);
    const data = EventSchema.parse(parsed);
    if (data.kind === EVENT_KINDS.PRICE_TICK) {
      for (const [ticker, value] of Object.entries(data.payload)) {
        const price = value.price;
        await insertTick(ticker as AssetSymbols, price).then(() =>
          console.log("data inserted"),
        );
      }
    }
  });
} catch (err) {
  console.error(err);
}
