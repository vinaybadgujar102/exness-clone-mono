import z from "zod";
import { AssetSymbols } from "@repo/types";

export const openTradeRequest = z.object({
  asset: z.enum(AssetSymbols),
  side: z.enum(["BUY", "SELL"]),
  margin: z.number(),
  leverage: z.number(),
});

export const closeTradeRequest = z.object({
  tradeId: z.string(),
});
