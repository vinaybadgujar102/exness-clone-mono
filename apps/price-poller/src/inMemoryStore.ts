import type {
  AssetBidAskPrice,
  AssetSymbols,
  BidAskPricePricePoller,
  BookTicker,
} from "@repo/types";

export const current_price_mid: Record<
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

export const current_price_bid_ask: BidAskPricePricePoller = {
  BTC_USDC: {
    bid: 0,
    ask: 0,
    decimal: 2,
  },
  ETH_USDC: {
    bid: 0,
    ask: 0,
    decimal: 2,
  },
};
