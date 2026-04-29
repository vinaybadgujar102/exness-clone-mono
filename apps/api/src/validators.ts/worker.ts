import { subscriber } from "@repo/redis";
import { JOB_KINDS, OrderResponseSchema, QUEUES } from "@repo/types";
import { pending } from "..";

export async function listenForResponse() {
  let lastId = "0";

  while (true) {
    try {
      const response = await subscriber.XREAD(
        { key: QUEUES.RESPONSE_STREAM, id: lastId },
        { BLOCK: 0, COUNT: 1 },
      );

      if (!response) continue;
      const message = response[0]?.messages[0];
      console.log(message);
      if (!message) continue;

      lastId = message.id;

      const raw = message.message.data;
      if (!raw) continue;

      const parsed = JSON.parse(raw);
      const data = OrderResponseSchema.parse(parsed);

      if (data.kind === JOB_KINDS.ORDER_RESPONSE) {
        const resolver = pending.get(data.requestId);

        if (!resolver) continue;
        resolver(data);
        pending.delete(data.requestId);
      }
    } catch (err) {
      console.error(err);
    }
  }
}
