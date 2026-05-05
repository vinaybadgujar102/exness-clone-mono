import type { OpenTrade } from "@/lib/api";
import { roundUsd2 } from "@/lib/tradingMetrics/formatting";
import type {
  CompleteSnapshotMetrics,
  QuoteMap,
  TradingMetricsSnapshotInput,
} from "@/lib/tradingMetrics/types";
import { AssetSymbols } from "@repo/types";

function unrealizedPnlUsd(
  trade: Pick<OpenTrade, "side" | "entryPrice" | "quantity">,
  bid: number,
  ask: number,
): number | null {
  if (bid <= 0 || ask <= 0) return null;
  const mark = trade.side === "BUY" ? bid : ask;
  const direction = trade.side === "BUY" ? 1 : -1;
  return (mark - trade.entryPrice) * direction * trade.quantity;
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
    marginInUse += trade.margin;
    const quote = quoteForTrade(trade.asset, quotes);
    if (!quote) return null;
    const upnl = unrealizedPnlUsd(trade, quote.bid, quote.ask);
    if (upnl == null) return null;
    aggregateLivePnl += upnl;
  }

  const balance = roundUsd2(accountBalance);
  const usedMargin = roundUsd2(marginInUse);
  const aggregatePnl = roundUsd2(aggregateLivePnl);
  const equity = roundUsd2(balance + usedMargin + aggregatePnl);
  const remainingMargin = roundUsd2(equity - usedMargin);

  if (usedMargin > 0 && remainingMargin > equity) return null;

  return {
    balance,
    equity,
    usedMargin,
    remainingMargin,
    aggregateLivePnl: aggregatePnl,
  };
}

