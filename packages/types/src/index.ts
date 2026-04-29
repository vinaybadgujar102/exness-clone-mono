import { z } from "zod";

export enum AssetSymbols {
  ETH = "ETH_USDC",
  BTC = "BTC_USDC",
}

export enum EVENT_KINDS {
  PRICE_TICK = "PRICE_TICK",
}

export enum JOB_KINDS {
  CREATE_ORDER = "CREATE_ORDER",
  ORDER_RESPONSE = "ORDER_RESPONSE",
  CLOSE_ORDER = "CLOSE_ORDER",
  GET_OPEN_TRADES = "GET_OPEN_TRADES",
}

export const PriceTickSchema = z.object({
  kind: z.literal(EVENT_KINDS.PRICE_TICK),
  payload: z.record(
    z.enum(AssetSymbols),
    z.object({ price: z.number(), decimal: z.number() }),
  ),
});

export const GetOpenOrdersSchema = z.object({
  kind: z.literal(JOB_KINDS.GET_OPEN_TRADES),
  requestId: z.string(),
  payload: z.object({
    email: z.string(),
  }),
});

export const CreateOrderSchema = z.object({
  kind: z.literal(JOB_KINDS.CREATE_ORDER),
  requestId: z.string(),
  payload: z.object({
    email: z.email(),
    trade: z.object({
      id: z.string(),
      quantity: z.number(),
      side: z.enum(["BUY", "SELL"]),
      margin: z.number(),
      leverage: z.number(),
      asset: z.enum(AssetSymbols),
    }),
  }),
});

export const CloseOrderSchema = z.object({
  kind: z.literal(JOB_KINDS.CLOSE_ORDER),
  requestId: z.string(),
  payload: z.object({
    email: z.string(),
    tradeId: z.string(),
  }),
});

export const OrderResponseSchema = z.object({
  kind: z.literal(JOB_KINDS.ORDER_RESPONSE),
  requestId: z.string(),
  payload: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
});

export const EventSchema = z.discriminatedUnion("kind", [
  GetOpenOrdersSchema,
  CreateOrderSchema,
  CloseOrderSchema,
  PriceTickSchema,
]);

export enum QUEUES {
  SEND_STREAM = "send_stream",
  RESPONSE_STREAM = "response_stream",
}

export interface BookTicker {
  e: string;
  E: number;
  s: string;
  a: string;
  A: string;
  b: string;
  B: string;
  u: string;
  T: number;
}

export interface AssetPrice {
  ticket: AssetSymbols;
  price: number;
}

export interface CurrentBuySellPrice {
  buyPrice: number;
  sellPrice: number;
  decimal: number;
}

export type TradeEnginePrices = Partial<
  Record<AssetSymbols, CurrentBuySellPrice>
>;
