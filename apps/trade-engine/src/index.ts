import {
  AssetSymbols,
  EVENT_KINDS,
  EventSchema,
  JOB_KINDS,
  OrderResponseSchema,
  QUEUES,
} from "@repo/types";
import { currentAssetPrices, users } from "./inMemoryDb";
import { z } from "zod";
import { publisher, subscriber } from "@repo/redis";
import {
  closeTrade,
  createTrade,
  getAccountSnapshotForUser,
  handleAddUser,
  liquidateTrades,
} from "./handlers";

let lastId = "0";

async function process() {
  while (true) {
    try {
      const res = await subscriber.XREAD(
        { key: QUEUES.SEND_STREAM, id: lastId },
        {
          BLOCK: 0,
          COUNT: 1,
        },
      );
      if (!res || !Array.isArray(res)) continue;
      const message = res[0]?.messages?.[0];
      if (!message) continue;
      lastId = message.id;
      const raw = message.message.data;
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const data = EventSchema.parse(parsed);

      // update prices
      if (data.kind === EVENT_KINDS.PRICE_TICK) {
        function handlePriceTick() {
          for (const [key, value] of Object.entries(data.payload)) {
            const scale = 10 ** value.decimal;
            const priceInt = Math.round(value.price * scale);
            const spreadInt = Math.round(0.01 * scale);

            const buyInt = priceInt + spreadInt;
            const sellInt = priceInt - spreadInt;

            currentAssetPrices[key as AssetSymbols] = {
              buyPrice: buyInt / scale,
              sellPrice: sellInt / scale,
              decimal: value.decimal,
            };
          }
        }
        handlePriceTick();
        liquidateTrades();
      }
      // create order
      else if (data.kind === JOB_KINDS.CREATE_ORDER) {
        const response = createTrade(data.payload.id, data);
        const payload: z.infer<typeof OrderResponseSchema> = {
          kind: JOB_KINDS.ORDER_RESPONSE,
          requestId: data.requestId,
          payload: response,
        };
        await publisher.XADD(QUEUES.RESPONSE_STREAM, "*", {
          data: JSON.stringify(payload),
        });
        // close order
      } else if (data.kind === JOB_KINDS.CLOSE_ORDER) {
        const response = closeTrade(data.payload.id, data.payload.tradeId);
        const payload = {
          kind: JOB_KINDS.ORDER_RESPONSE,
          requestId: data.requestId,
          payload: response,
        };
        await publisher.XADD(QUEUES.RESPONSE_STREAM, "*", {
          data: JSON.stringify(payload),
        });
        // get open trades
      } else if (data.kind === JOB_KINDS.GET_OPEN_TRADES) {
        const snap = getAccountSnapshotForUser(data.payload.id);
        const payload: z.infer<typeof OrderResponseSchema> = {
          kind: JOB_KINDS.ORDER_RESPONSE,
          requestId: data.requestId,
          payload:
            snap === undefined
              ? { success: false, message: "USER_NOT_FOUND" }
              : {
                  success: true,
                  message: "OPEN_TRADES",
                  data: {
                    trades: snap.trades,
                    balance: snap.balance,
                  },
                },
        };
        await publisher.XADD(QUEUES.RESPONSE_STREAM, "*", {
          data: JSON.stringify(payload),
        });
      }
      // add user
      else if (data.kind === JOB_KINDS.ADD_USER) {
        const response = handleAddUser(data.payload.id);
        const payload = {
          kind: JOB_KINDS.ORDER_RESPONSE,
          requestId: data.requestId,
          payload: response,
        };
        await publisher.XADD(QUEUES.RESPONSE_STREAM, "*", {
          data: JSON.stringify(payload),
        });
      }
    } catch (error) {
      continue;
    }
  }
}

process();
