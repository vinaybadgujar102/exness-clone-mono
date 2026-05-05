import { z } from "zod";

export enum AssetSymbols {
  ETH = "ETHUSDT",
  BTC = "BTCUSDT",
}

export enum EVENT_KINDS {
  PRICE_TICK = "PRICE_TICK",
  BID_ASK_TICK = "BID_ASK_TICK",
}

export enum JOB_KINDS {
  CREATE_ORDER = "CREATE_ORDER",
  ORDER_RESPONSE = "ORDER_RESPONSE",
  CLOSE_ORDER = "CLOSE_ORDER",
  GET_OPEN_TRADES = "GET_OPEN_TRADES",
  ADD_USER = "ADD_USER",
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
    id: z.number(),
  }),
});

export const CreateOrderSchema = z.object({
  kind: z.literal(JOB_KINDS.CREATE_ORDER),
  requestId: z.string(),
  payload: z.object({
    id: z.number(),
    trade: z.object({
      id: z.string(),
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
    id: z.number(),
    tradeId: z.string(),
  }),
});

export const AddUserSchema = z.object({
  kind: z.literal(JOB_KINDS.ADD_USER),
  requestId: z.string(),
  payload: z.object({
    id: z.number(),
  }),
});

export const OrderResponseSchema = z.object({
  kind: z.literal(JOB_KINDS.ORDER_RESPONSE),
  requestId: z.string(),
  payload: z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.any().optional(),
    /** Present on successful CLOSE_ORDER (engine wallet after close). */
    balance: z.number().optional(),
  }),
});

export const BidAskTickSchema = z.object({
  kind: z.literal(EVENT_KINDS.BID_ASK_TICK),
  payload: z.record(
    z.enum(AssetSymbols),
    z.object({ bid: z.number(), ask: z.number(), decimal: z.number() }),
  ),
});

export const EventSchema = z.discriminatedUnion("kind", [
  GetOpenOrdersSchema,
  CreateOrderSchema,
  CloseOrderSchema,
  PriceTickSchema,
  BidAskTickSchema,
  AddUserSchema,
]);

export enum QUEUES {
  SEND_STREAM = "send_stream",
  RESPONSE_STREAM = "response_stream",
}

export type Trade = {
  id: string;
  userId: number;
  asset: AssetSymbols;
  side: "BUY" | "SELL";
  entryPrice: number;
  margin: number;
  leverage: number;
  notional: number;
  quantity: number;
  pnl: number;
  status: "OPEN" | "CLOSED";
  createdAt: number;
  liquidationPrice: number;
};

export interface BookTicker {
  e: string;
  E: number;
  s: string;
  a: number;
  p: string; // price
  q: string;
  f: number;
  l: number;
  T: number;
  m: boolean;
  M: boolean;
}

export type BidAskPricePricePoller = Record<
  AssetSymbols,
  { bid: number; ask: number; decimal: number }
>;

export interface AssetMidPrice {
  ticker: AssetSymbols;
  price: number;
}

export interface AssetBidAskPrice {
  ticker: AssetSymbols;
  bid: number;
  ask: number;
}

export interface CurrentBuySellPrice {
  buyPrice: number;
  sellPrice: number;
  decimal: number;
}

export type TradeEnginePrices = Partial<
  Record<AssetSymbols, CurrentBuySellPrice>
>;
