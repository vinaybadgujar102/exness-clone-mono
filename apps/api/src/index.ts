import express from "express";
import cors from "cors";
import { publisher, subscriber } from "@repo/redis";
import { requestValidator } from "./validators.ts";
import {
  closeTradeRequest,
  openTradeRequest,
} from "./validators.ts/tradeValidator.ts";
import crypto from "crypto";
import type z from "zod";
import {
  CloseOrderSchema,
  CreateOrderSchema,
  EVENT_KINDS,
  GetOpenOrdersSchema,
  JOB_KINDS,
  QUEUES,
} from "@repo/types";
import { listenForResponse } from "./validators.ts/worker.ts";

const app = express();
app.use(cors());
app.use(express.json());

export const pending = new Map();

app.post(
  "/api/v1/trade",
  requestValidator(openTradeRequest),
  async (req, res) => {
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

app.get("/api/v1/trades", async (req, res) => {
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

app.post("/api/v1/trade/close", async (req, res) => {
  const { tradeId } = req.body as z.infer<typeof closeTradeRequest>;
  console.log("here");
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

app.listen(3000, () => {
  console.log("app listening on 3000");
});

listenForResponse();
