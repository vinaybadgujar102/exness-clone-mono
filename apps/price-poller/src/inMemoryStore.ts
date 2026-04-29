import type { AssetSymbols } from "@repo/types";

export const current_price: Record<
  AssetSymbols,
  { price: number; decimal: number }
> = {
  BTC_USDC: {
    price: 0,
    decimal: 2,
  },
  ETH_USDC: {
    price: 0,
    decimal: 2,
  },
};
