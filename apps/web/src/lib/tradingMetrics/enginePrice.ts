import { ASSETSCONFIG, type AssetSymbols } from "@repo/types";

export function isEngineAssetSymbol(asset: string): asset is AssetSymbols {
  return Object.prototype.hasOwnProperty.call(ASSETSCONFIG, asset);
}

/** Trade engine / API store prices as integer ticks: `round(usd * priceScale)`. */
export function enginePriceToUsd(asset: string, engineTicks: number): number {
  if (!isEngineAssetSymbol(asset)) return engineTicks;
  return engineTicks / ASSETSCONFIG[asset].priceScale;
}
