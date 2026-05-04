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
  BTCUSDT: {
    price: 0,
    decimal: 2,
  },
  ETHUSDT: {
    price: 0,
    decimal: 2,
  },
};

export const current_price_bid_ask: BidAskPricePricePoller = {
  BTCUSDT: {
    bid: 0,
    ask: 0,
    decimal: 2,
  },
  ETHUSDT: {
    bid: 0,
    ask: 0,
    decimal: 2,
  },
};
