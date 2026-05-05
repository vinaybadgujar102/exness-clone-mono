import type { OpenTrade } from "@/lib/api";
import type { AssetSymbols } from "@repo/types";

export type QuoteMap = Record<
  AssetSymbols,
  {
    bid: number;
    ask: number;
    up: boolean;
  }
>;

export type MetricFreshnessState = {
  lastCompleteSnapshotAt: number | null;
  staleAfterMs: number;
  isStale: boolean;
};

export type AccountMetricSnapshot = {
  snapshotVersion: number;
  capturedAt: number;
  isComplete: true;
  balance: number;
  equity: number;
  usedMargin: number;
  remainingMargin: number;
  aggregateLivePnl: number;
};

export type CompleteSnapshotMetrics = Omit<
  AccountMetricSnapshot,
  "snapshotVersion" | "capturedAt" | "isComplete"
>;

export type TradingMetricsSnapshotInput = {
  accountBalance: number | null;
  openTrades: OpenTrade[];
  quotes: QuoteMap;
};

