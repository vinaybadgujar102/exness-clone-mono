import {
  CreateOrderSchema,
  EVENT_KINDS,
  EventSchema,
  JOB_KINDS,
  OrderResponseSchema,
  QUEUES,
} from "@repo/types";
import { currentAssetPrices, users, type Trade } from "./inMemoryDb";
import { z } from "zod";
import { publisher, subscriber } from "@repo/redis";
import {
  closeTrade,
  createTrade,
  getOpenTradesForUser,
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
      if (data.kind === EVENT_KINDS.BID_ASK_TICK) {
        const payload = data.payload;
        currentAssetPrices.BTCUSDT = {
          buyPrice: payload.BTCUSDT.bid,
          sellPrice: payload.BTCUSDT.ask,
          decimal: payload.BTCUSDT.decimal,
        };
        currentAssetPrices.ETHUSDT = {
          buyPrice: payload.ETHUSDT.bid,
          sellPrice: payload.ETHUSDT.ask,
          decimal: payload.ETHUSDT.decimal,
        };

        liquidateTrades();
      }
      // create order
      else if (data.kind === JOB_KINDS.CREATE_ORDER) {
        if (users.length === 0) {
          const user = {
            email: "vinaybadgujar8@gmail.com",
            balance: 1000000,
            openTrades: {},
          };
          users.push(user);
        }
        const response = createTrade(data.payload.email, data);
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
        console.log("here");
        const response = closeTrade(data.payload.email, data.payload.tradeId);
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
        const response = getOpenTradesForUser(data.payload.email);
      }
      // add user
      else if (data.kind === JOB_KINDS.ADD_USER) {
        const response = handleAddUser(data.payload.email);
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
