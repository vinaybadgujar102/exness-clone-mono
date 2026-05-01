"use client";

import {
  CandlestickSeries,
  ColorType,
  createChart,
  type UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useRef } from "react";

type Candle = {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
};

function seedCandles(base: number, count: number, stepSec: number): Candle[] {
  const start = Math.floor(Date.now() / 1000) - count * stepSec;
  const out: Candle[] = [];
  let last = base;
  for (let i = 0; i < count; i++) {
    const drift = (Math.sin(i / 7) + (Math.random() - 0.45)) * 6;
    const o = last;
    const c = o + drift;
    const h = Math.max(o, c) + Math.random() * 5;
    const l = Math.min(o, c) - Math.random() * 5;
    out.push({
      time: (start + i * stepSec) as UTCTimestamp,
      open: o,
      high: h,
      low: l,
      close: c,
    });
    last = c;
  }
  return out;
}

type Props = {
  className?: string;
};

export function WebTradingChart({ className }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

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
        vertLine: { color: "#4b5563", width: 1, style: 2, labelBackgroundColor: "#374151" },
        horzLine: { color: "#4b5563", width: 1, style: 2, labelBackgroundColor: "#374151" },
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

    series.setData(seedCandles(4592, 180, 60));
    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, []);

  return <div ref={wrapRef} className={className ?? "h-full min-h-[280px] w-full"} />;
}
