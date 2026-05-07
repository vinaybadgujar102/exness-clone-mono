import { ASSETSCONFIG, BALANCE_SCALE, type AssetSymbols } from "@repo/types";

export function isEngineAssetSymbol(asset: string): asset is AssetSymbols {
  return Object.prototype.hasOwnProperty.call(ASSETSCONFIG, asset);
}

/** Trade engine / API store prices as integer ticks: `round(usd * priceScale)`. */
export function enginePriceToUsd(asset: string, engineTicks: number): number {
  if (!isEngineAssetSymbol(asset)) return engineTicks;
  return engineTicks / ASSETSCONFIG[asset].priceScale;
}

/** Engine/API store quantities as integer ticks: `round(units * quantityScale)`. */
export function engineQuantityToUnits(asset: string, engineTicks: number): number {
  if (!isEngineAssetSymbol(asset)) return engineTicks;
  return engineTicks / ASSETSCONFIG[asset].quantityScale;
}

/** Engine/API store USD-like amounts scaled by `BALANCE_SCALE` (e.g. cents when 100). */
export function engineMoneyToUsd(engineTicks: number): number {
  return engineTicks / BALANCE_SCALE;
}

/**
 * Some streams may send a price already-normalized (float) OR scaled (int ticks) with a `decimal`.
 * This helper normalizes without double-scaling.
 */
export function normalizeMaybeScaledPrice(value: number, decimal: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(decimal) || decimal <= 0) return value;
  if (!Number.isInteger(value)) return value;
  const scale = 10 ** decimal;
  return Math.abs(value) >= scale * 1000 ? value / scale : value;
}
