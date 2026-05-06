import {
  ASSETSCONFIG,
  type AssetBidAskPrice,
  type AssetMidPrice,
  type AssetSymbols,
  type BookTicker,
} from "@repo/types";

export function transform(data: BookTicker): AssetMidPrice {
  const priceScale = ASSETSCONFIG[data.s as AssetSymbols].priceScale;
  const transformedData: AssetMidPrice = {
    ticker: data.s as AssetSymbols,
    price: convertToInteger(Number(data.p), priceScale),
  };
  return transformedData;
}

export function transformToBidAsk(data: BookTicker): AssetBidAskPrice {
  const { priceScale, spread } = ASSETSCONFIG[data.s as AssetSymbols];
  const intPrice = convertToInteger(Number(data.p), priceScale);

  const bidPrice = intPrice - spread;
  const askPrice = intPrice + spread;

  const transformedData: AssetBidAskPrice = {
    ticker: data.s as AssetSymbols,
    bid: bidPrice,
    ask: askPrice,
  };
  return transformedData;
}

export function convertToInteger(price: number, priceScale: number) {
  return Math.round(price * priceScale);
}
