"use client";

import { useEffect, useMemo, useState } from "react";

import { createFreshnessState } from "@/lib/tradingMetrics/freshness";
import { selectMetricsViewModel } from "@/lib/tradingMetrics/selectors";
import { buildCompleteSnapshot } from "@/lib/tradingMetrics/snapshotPipeline";
import type { AccountMetricSnapshot, TradingMetricsSnapshotInput } from "@/lib/tradingMetrics/types";

export function useTradingMetrics(input: TradingMetricsSnapshotInput) {
  const [lastSnapshot, setLastSnapshot] = useState<AccountMetricSnapshot | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const candidateSnapshot = useMemo(() => buildCompleteSnapshot(input), [input]);

  useEffect(() => {
    if (!candidateSnapshot) return;
    setLastSnapshot((prev) => {
      if (
        prev &&
        prev.balance === candidateSnapshot.balance &&
        prev.equity === candidateSnapshot.equity &&
        prev.usedMargin === candidateSnapshot.usedMargin &&
        prev.remainingMargin === candidateSnapshot.remainingMargin &&
        prev.aggregateLivePnl === candidateSnapshot.aggregateLivePnl
      ) {
        return prev;
      }

      const nextVersion = (prev?.snapshotVersion ?? 0) + 1;
      return {
        snapshotVersion: nextVersion,
        capturedAt: Date.now(),
        isComplete: true,
        ...candidateSnapshot,
      };
    });
  }, [candidateSnapshot]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const freshness = useMemo(
    () => createFreshnessState(lastSnapshot?.capturedAt ?? null, nowMs),
    [lastSnapshot?.capturedAt, nowMs],
  );

  const metrics = useMemo(() => selectMetricsViewModel(lastSnapshot), [lastSnapshot]);

  return {
    metrics,
    snapshotVersion: lastSnapshot?.snapshotVersion ?? null,
    isStale: freshness.isStale,
  };
}

