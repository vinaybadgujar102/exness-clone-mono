import { subscriber } from "@repo/redis";
import { AssetSymbols, EVENT_KINDS, EventSchema, QUEUES } from "@repo/types";
import {
  createFiveMinCandles,
  createOneMinCandles,
  initDB,
  insertTick,
} from "./dbUtils";

await initDB();
await createOneMinCandles();
await createFiveMinCandles();

while (true) {
  const response = await subscriber.XREAD(
    { key: QUEUES.SEND_STREAM, id: "$" },
    {
      BLOCK: 0,
      COUNT: 1,
    },
  );

  if (!response) {
    continue;
  }

  const raw = response[0]?.messages[0]?.message.data;
  if (!raw) {
    continue;
  }

  const parsed = JSON.parse(raw);
  const data = EventSchema.parse(parsed);
  if (data.kind === EVENT_KINDS.PRICE_TICK) {
    // push data to db
    for (const [ticker, value] of Object.entries(data.payload)) {
      const price = value.price;
      await insertTick(ticker as AssetSymbols, price).then(() =>
        console.log("data inserted"),
      );
    }
  }
}
