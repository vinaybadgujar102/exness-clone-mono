import type { OpenTrade } from "@/lib/api";
import { engineMoneyToUsd, enginePriceToUsd, engineQuantityToUnits } from "@/lib/tradingMetrics/enginePrice";
import { roundUsd2 } from "@/lib/tradingMetrics/formatting";
import type {
  CompleteSnapshotMetrics,
  QuoteMap,
  TradingMetricsSnapshotInput,
} from "@/lib/tradingMetrics/types";
import { AssetSymbols } from "@repo/types";

function unrealizedPnlUsd(
  trade: Pick<OpenTrade, "asset" | "side" | "entryPrice" | "quantity">,
  bid: number,
  ask: number,
): number | null {
  if (bid <= 0 || ask <= 0) return null;
  const entryUsd = enginePriceToUsd(trade.asset, trade.entryPrice);
  const mark = trade.side === "BUY" ? bid : ask;
  const direction = trade.side === "BUY" ? 1 : -1;
  const qtyUnits = engineQuantityToUnits(trade.asset, trade.quantity);
  return (mark - entryUsd) * direction * qtyUnits;
}

function quoteForTrade(symbol: string, quotes: QuoteMap) {
  if (!Object.values(AssetSymbols).includes(symbol as AssetSymbols)) return null;
  return quotes[symbol as AssetSymbols] ?? null;
}

export function buildCompleteSnapshot(
  input: TradingMetricsSnapshotInput,
): CompleteSnapshotMetrics | null {
  const { accountBalance, openTrades, quotes } = input;
  if (accountBalance == null) return null;

  let marginInUse = 0;
  let aggregateLivePnl = 0;

  for (const trade of openTrades) {
    marginInUse += engineMoneyToUsd(trade.margin);
    const quote = quoteForTrade(trade.asset, quotes);
    if (!quote) continue;
    const upnl = unrealizedPnlUsd(trade, quote.bid, quote.ask);
    if (upnl == null) continue;
    aggregateLivePnl += upnl;
  }

  // Engine accountBalance is withdrawable funds after margin reservation.
  const availableWalletFunds = roundUsd2(engineMoneyToUsd(accountBalance));
  const usedMargin = roundUsd2(marginInUse);
  const aggregatePnl = roundUsd2(aggregateLivePnl);
  // Balance = total wallet funds excluding unrealized PnL.
  const balance = roundUsd2(availableWalletFunds + usedMargin);
  // Equity = account value right now, including live PnL.
  const equity = roundUsd2(balance + aggregatePnl);
  // Free margin = funds available for opening new trades.
  const remainingMargin = roundUsd2(equity - usedMargin);

  return {
    balance,
    equity,
    usedMargin,
    remainingMargin,
    aggregateLivePnl: aggregatePnl,
  };
}

