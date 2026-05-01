import { Router, type Request, type Response } from "express";
import { pending } from "..";
import {
  CloseOrderSchema,
  CreateOrderSchema,
  GetOpenOrdersSchema,
  JOB_KINDS,
  QUEUES,
} from "@repo/types";
import { publisher } from "@repo/redis";
import type z from "zod";
import { requestValidator } from "../validators.ts";
import {
  closeTradeRequest,
  openTradeRequest,
} from "../validators.ts/tradeValidator";

const tradeRouter = Router();

tradeRouter.get("/api/v1/trades", async (req, res) => {
  const { email } = req.body;

  const requestId = crypto.randomUUID();
  const promise = new Promise((resolve) => {
    pending.set(requestId, resolve);
  });

  const payload: z.infer<typeof GetOpenOrdersSchema> = {
    kind: JOB_KINDS.GET_OPEN_TRADES,
    requestId,
    payload: {
      email,
    },
  };

  await publisher.XADD(QUEUES.SEND_STREAM, "*", {
    data: JSON.stringify(payload),
  });

  const response = await promise;

  res.json(response);
});

tradeRouter.post(
  "/trade",
  requestValidator(openTradeRequest),
  async (req: Request, res: Response) => {
    const { asset, quantity, margin, side, leverage } = req.body as z.infer<
      typeof openTradeRequest
    >;
    const tradeId = crypto.randomUUID();
    // to uniquely identify our request
    const requestId = crypto.randomUUID();

    const payload: z.infer<typeof CreateOrderSchema> = {
      kind: JOB_KINDS.CREATE_ORDER,
      requestId,
      payload: {
        email: "vinaybadgujar8@gmail.com",
        trade: {
          id: tradeId,
          quantity,
          side,
          margin,
          leverage,
          asset,
        },
      },
    };

    const promise = new Promise((resolve, reject) => {
      pending.set(requestId, resolve);
    });

    await publisher.XADD(QUEUES.SEND_STREAM, "*", {
      data: JSON.stringify(payload),
    });

    const response = await promise;

    return res.json({
      data: response,
    });
  },
);

tradeRouter.post("/api/v1/trade/close", async (req, res) => {
  const { tradeId } = req.body as z.infer<typeof closeTradeRequest>;
  const requestId = crypto.randomUUID();
  const payload: z.infer<typeof CloseOrderSchema> = {
    kind: JOB_KINDS.CLOSE_ORDER,
    requestId,
    payload: {
      email: "vinaybadgujar8@gmail.com",
      tradeId,
    },
  };
  console.log(payload);
  const promise = new Promise((resolve) => {
    pending.set(requestId, resolve);
  });

  await publisher.XADD(QUEUES.SEND_STREAM, "*", {
    data: JSON.stringify(payload),
  });

  const response = await promise;

  res.json(response);
});

export default tradeRouter;
