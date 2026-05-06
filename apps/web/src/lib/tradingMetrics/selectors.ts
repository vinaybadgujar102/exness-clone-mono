import type { AccountMetricSnapshot } from "@/lib/tradingMetrics/types";

export type MetricsViewModel = {
  version: number;
  equity: number;
  balance: number;
  usedMargin: number;
  remainingMargin: number;
  aggregateLivePnl: number;
};

export function selectMetricsViewModel(
  snapshot: AccountMetricSnapshot | null,
): MetricsViewModel | null {
  if (!snapshot) return null;
  return {
    version: snapshot.snapshotVersion,
    equity: snapshot.equity,
    balance: snapshot.balance,
    usedMargin: snapshot.usedMargin,
    remainingMargin: snapshot.remainingMargin,
    aggregateLivePnl: snapshot.aggregateLivePnl,
  };
}

