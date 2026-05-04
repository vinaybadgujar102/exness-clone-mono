import type {
  AssetBidAskPrice,
  AssetMidPrice,
  AssetSymbols,
  BookTicker,
} from "@repo/types";

export function transform(data: BookTicker): AssetMidPrice {
  const transformedData: AssetMidPrice = {
    ticker: data.s as AssetSymbols,
    price: Number(data.p),
  };
  return transformedData;
}

export function transformToBidAsk(data: BookTicker): AssetBidAskPrice {
  const transformedData: AssetBidAskPrice = {
    ticker: data.s as AssetSymbols,
    bid: Number(Number(data.p) - 0.2 / 2), // 0.2% slippage
    ask: Number(Number(data.p) + 0.2 / 2),
  };
  return transformedData;
}
