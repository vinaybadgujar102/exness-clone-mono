import type { MetricFreshnessState } from "@/lib/tradingMetrics/types";

export const STALE_AFTER_MS = 10_000;

export function createFreshnessState(
  lastCompleteSnapshotAt: number | null,
  nowMs: number,
): MetricFreshnessState {
  const isStale =
    lastCompleteSnapshotAt != null && nowMs - lastCompleteSnapshotAt >= STALE_AFTER_MS;
  return {
    lastCompleteSnapshotAt,
    staleAfterMs: STALE_AFTER_MS,
    isStale,
  };
}

