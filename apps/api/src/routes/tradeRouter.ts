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
import { requestValidator } from "../validators/index.ts";
import {
  closeTradeRequest,
  openTradeRequest,
} from "../validators/tradeValidator.ts";
import { prisma } from "../lib/prisma.ts";

const tradeRouter = Router();

tradeRouter.get("/trades", async (req, res) => {
  const user = await prisma.user.findFirst({
    where: { id: Number(req.userId) },
  });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const requestId = crypto.randomUUID();
  const promise = new Promise((resolve) => {
    pending.set(requestId, resolve);
  });

  const payload: z.infer<typeof GetOpenOrdersSchema> = {
    kind: JOB_KINDS.GET_OPEN_TRADES,
    requestId,
    payload: {
      email: user.email,
    },
  };

  await publisher.XADD(QUEUES.SEND_STREAM, "*", {
    data: JSON.stringify(payload),
  });

  const envelope = (await promise) as {
    payload: { success: boolean; message: string; data?: unknown };
  };

  if (!envelope.payload.success) {
    return res.status(400).json({ error: envelope.payload.message });
  }

  const raw = envelope.payload.data;
  let trades: unknown[] = [];
  let balance = 10_000;
  if (Array.isArray(raw)) {
    trades = raw;
  } else if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const d = raw as Record<string, unknown>;
    if (Array.isArray(d.trades)) trades = d.trades;
    if (typeof d.balance === "number") balance = d.balance;
  }

  return res.json({ data: { trades, balance } });
});

tradeRouter.post(
  "/trade",
  requestValidator(openTradeRequest),
  async (req: Request, res: Response) => {
    const { asset, margin, side, leverage } = req.body as z.infer<
      typeof openTradeRequest
    >;
    const tradeId = crypto.randomUUID();
    // to uniquely identify our request
    const requestId = crypto.randomUUID();
    const user = await prisma.user.findFirst({
      where: {
        id: Number(req.userId),
      },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const payload: z.infer<typeof CreateOrderSchema> = {
      kind: JOB_KINDS.CREATE_ORDER,
      requestId,
      payload: {
        email: user.email,
        trade: {
          id: tradeId,
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

tradeRouter.post(
  "/close",
  requestValidator(closeTradeRequest),
  async (req: Request, res: Response) => {
    const { tradeId } = req.body as z.infer<typeof closeTradeRequest>;
    const user = await prisma.user.findFirst({
      where: { id: Number(req.userId) },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const requestId = crypto.randomUUID();
    const payload: z.infer<typeof CloseOrderSchema> = {
      kind: JOB_KINDS.CLOSE_ORDER,
      requestId,
      payload: {
        email: user.email,
        tradeId,
      },
    };

    const promise = new Promise((resolve) => {
      pending.set(requestId, resolve);
    });

    await publisher.XADD(QUEUES.SEND_STREAM, "*", {
      data: JSON.stringify(payload),
    });

    const envelope = (await promise) as {
      payload: { success: boolean; message: string; balance?: number };
    };

    if (!envelope.payload.success) {
      return res.status(400).json({ error: envelope.payload.message });
    }

    return res.json({
      data: {
        message: envelope.payload.message,
        balance: envelope.payload.balance,
      },
    });
  },
);

export default tradeRouter;
