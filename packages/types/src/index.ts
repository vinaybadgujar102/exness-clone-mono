import { z } from "zod";

export enum AssetSymbols {
  ETH = "ETH_USDC",
  BTC = "BTC_USDC",
}

const createEventSchema = <T extends z.ZodType>(payloadSchema: T) => {
  return z.object({
    kind: z.string(),
    payload: payloadSchema,
  });
};

export const PriceSchema = z.record(
  z.enum(AssetSymbols),
  z.object({
    price: z.number(),
  }),
);

export const TickUpdateEventSchema = createEventSchema(PriceSchema);

export enum QUEUES {
  SEND_STREAM = "send_stream",
}

export enum JOB_KINDS {
  CREATE_ORDER = "create_order",
  PRICE_TICK = "price_tick",
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
