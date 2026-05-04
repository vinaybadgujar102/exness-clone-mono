"use client";

import { getKlines } from "@/lib/api";
import { AssetSymbols } from "@repo/types";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type ISeriesApi,
  type OhlcData,
  type UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useRef } from "react";

export type ChartInterval = "1m" | "5m";

type Props = {
  asset: AssetSymbols;
  interval: ChartInterval;
  /** Mid price from bid/ask for the chart asset; updates the forming candle. */
  liveMid: number | null;
  className?: string;
};

type BucketState = {
  bucket: number;
  open: number;
  high: number;
  low: number;
};

type LastBarSnapshot = {
  time: number;
  open: number;
  high: number;
  low: number;
};

function intervalSeconds(iv: ChartInterval): number {
  return iv === "1m" ? 60 : 300;
}

function alignBucketStart(tsSec: number, iv: ChartInterval): number {
  const step = intervalSeconds(iv);
  return Math.floor(tsSec / step) * step;
}

function applyMidToSeries(
  series: ISeriesApi<"Candlestick">,
  mid: number,
  interval: ChartInterval,
  lastBarTime: { current: number | null },
  bucketState: { current: BucketState | null },
  lastLoadedBar: { current: LastBarSnapshot | null },
) {
  const nowSec = Math.floor(Date.now() / 1000);
  const bucket = alignBucketStart(nowSec, interval);
  const lastT = lastBarTime.current;

  if (lastT === null) {
    series.update({
      time: bucket as UTCTimestamp,
      open: mid,
      high: mid,
      low: mid,
      close: mid,
    });
    lastBarTime.current = bucket;
    bucketState.current = { bucket, open: mid, high: mid, low: mid };
    return;
  }

  if (bucket > lastT) {
    series.update({
      time: bucket as UTCTimestamp,
      open: mid,
      high: mid,
      low: mid,
      close: mid,
    });
    lastBarTime.current = bucket;
    bucketState.current = { bucket, open: mid, high: mid, low: mid };
    return;
  }

  if (bucket < lastT) {
    return;
  }

  const st = bucketState.current;
  let open: number;
  let high: number;
  let low: number;

  if (st && st.bucket === bucket) {
    open = st.open;
    high = Math.max(st.high, mid);
    low = Math.min(st.low, mid);
  } else {
    const snap = lastLoadedBar.current;
    if (snap && snap.time === bucket) {
      open = snap.open;
      high = Math.max(snap.high, mid);
      low = Math.min(snap.low, mid);
    } else {
      open = mid;
      high = mid;
      low = mid;
    }
  }

  bucketState.current = { bucket, open, high, low };
  series.update({
    time: bucket as UTCTimestamp,
    open,
    high,
    low,
    close: mid,
  });
}

export function WebTradingChart({
  className,
  asset,
  interval,
  liveMid,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const historyLoadedRef = useRef(false);
  const lastBarTimeRef = useRef<number | null>(null);
  const bucketStateRef = useRef<BucketState | null>(null);
  const lastLoadedBarRef = useRef<LastBarSnapshot | null>(null);
  const liveMidRef = useRef<number | null>(liveMid);
  liveMidRef.current = liveMid;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    let cancelled = false;
    historyLoadedRef.current = false;
    seriesRef.current = null;
    lastBarTimeRef.current = null;
    bucketStateRef.current = null;
    lastLoadedBarRef.current = null;

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: "#0f1115" },
        textColor: "#9ca3af",
        fontFamily: "var(--font-dm-sans), ui-sans-serif, system-ui",
      },
      grid: {
        vertLines: { color: "#1f232d" },
        horzLines: { color: "#1f232d" },
      },
      rightPriceScale: {
        borderColor: "#2a2e39",
        scaleMargins: { top: 0.08, bottom: 0.15 },
      },
      timeScale: {
        borderColor: "#2a2e39",
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        vertLine: {
          color: "#4b5563",
          width: 1,
          style: 2,
          labelBackgroundColor: "#374151",
        },
        horzLine: {
          color: "#4b5563",
          width: 1,
          style: 2,
          labelBackgroundColor: "#374151",
        },
      },
      autoSize: true,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#2196f3",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#2196f3",
      wickDownColor: "#ef5350",
    });
    seriesRef.current = series;

    void getKlines(asset, interval).then((data) => {
      if (cancelled) return;
      const candles = (Array.isArray(data) ? data : []) as OhlcData<UTCTimestamp>[];
      series.setData(candles);

      const last = candles[candles.length - 1];
      const nowSec = Math.floor(Date.now() / 1000);
      const currentBucket = alignBucketStart(nowSec, interval);

      if (last) {
        const t = last.time as number;
        lastLoadedBarRef.current = {
          time: t,
          open: last.open,
          high: last.high,
          low: last.low,
        };
        lastBarTimeRef.current = t;
        if (t === currentBucket) {
          bucketStateRef.current = {
            bucket: currentBucket,
            open: last.open,
            high: last.high,
            low: last.low,
          };
        } else {
          bucketStateRef.current = null;
        }
      } else {
        lastLoadedBarRef.current = null;
        lastBarTimeRef.current = null;
        bucketStateRef.current = null;
      }

      historyLoadedRef.current = true;

      const m = liveMidRef.current;
      if (m != null && Number.isFinite(m)) {
        applyMidToSeries(
          series,
          m,
          interval,
          lastBarTimeRef,
          bucketStateRef,
          lastLoadedBarRef,
        );
      }

      chart.timeScale().fitContent();
    });

    return () => {
      cancelled = true;
      historyLoadedRef.current = false;
      seriesRef.current = null;
      lastBarTimeRef.current = null;
      bucketStateRef.current = null;
      lastLoadedBarRef.current = null;
      chart.remove();
    };
  }, [asset, interval]);

  useEffect(() => {
    if (!historyLoadedRef.current) return;
    const series = seriesRef.current;
    if (!series || liveMid == null || !Number.isFinite(liveMid)) return;
    applyMidToSeries(
      series,
      liveMid,
      interval,
      lastBarTimeRef,
      bucketStateRef,
      lastLoadedBarRef,
    );
  }, [liveMid, interval]);

  return (
    <div ref={wrapRef} className={className ?? "h-full min-h-[280px] w-full"} />
  );
}
