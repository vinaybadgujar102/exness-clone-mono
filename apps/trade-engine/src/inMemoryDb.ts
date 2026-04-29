import type { AssetSymbols, TradeEnginePrices } from "@repo/types";

export type Trade = {
  id: string;
  email: string;
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

export type Users = {
  email: string;
  balance: number;
  openTrades: Record<string, Trade>;
}[];

export const currentAssetPrices: TradeEnginePrices = {};
export const users: Users = [];
