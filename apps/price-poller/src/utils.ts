import type {
  AssetBidAskPrice,
  AssetMidPrice,
  AssetSymbols,
  BookTicker,
} from "@repo/types";

export function transform(data: BookTicker): AssetMidPrice {
  const transformedData: AssetMidPrice = {
    ticker: data.s as AssetSymbols,
    price: Number(data.a),
  };
  return transformedData;
}

export function transformToBidAsk(data: BookTicker): AssetBidAskPrice {
  const transformedData: AssetBidAskPrice = {
    ticker: data.s as AssetSymbols,
    bid: Number(data.b),
    ask: Number(data.a),
  };
  return transformedData;
}
