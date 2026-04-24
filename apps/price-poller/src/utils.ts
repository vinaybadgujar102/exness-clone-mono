import type { AssetPrice, AssetSymbols, BookTicker } from "@repo/types";

export function transform(data: BookTicker): AssetPrice {
  const transformedData: AssetPrice = {
    ticket: data.s as AssetSymbols,
    price: Number(data.a),
  };
  return transformedData;
}
