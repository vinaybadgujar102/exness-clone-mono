"use client";

import { getKlines } from "@/lib/api";
import { AssetSymbols } from "@repo/types";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  type OhlcData,
  type UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useRef } from "react";

export type ChartInterval = "1m" | "5m";

type Props = {
  asset: AssetSymbols;
  interval: ChartInterval;
  className?: string;
};

export function WebTradingChart({ className, asset, interval }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    let cancelled = false;

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

    void getKlines(asset, interval).then((data) => {
      if (cancelled) return;
      const candles = (Array.isArray(data) ? data : []) as OhlcData<UTCTimestamp>[];
      series.setData(candles);
      chart.timeScale().fitContent();
    });

    return () => {
      cancelled = true;
      chart.remove();
    };
  }, [asset, interval]);

  return (
    <div ref={wrapRef} className={className ?? "h-full min-h-[280px] w-full"} />
  );
}
