"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { WebTradingChart } from "@/components/web-trading-chart";

type Instrument = {
  sym: string;
  bid: number;
  ask: number;
  up: boolean;
};

const INSTRUMENTS: Instrument[] = [
  { sym: "BTC", bid: 97234.12, ask: 97256.88, up: true },
  { sym: "XAU/USD", bid: 4591.42, ask: 4591.87, up: false },
  { sym: "XAG/USD", bid: 32.38, ask: 32.41, up: true },
  { sym: "ETH", bid: 3456.2, ask: 3457.1, up: true },
  { sym: "USOIL", bid: 71.22, ask: 71.28, up: false },
  { sym: "USD/JPY", bid: 149.82, ask: 149.86, up: true },
  { sym: "EUR/USD", bid: 1.0842, ask: 1.0845, up: false },
  { sym: "USTEC", bid: 21456.0, ask: 21462.0, up: true },
];

function fmt(n: number) {
  if (n >= 1000 && n < 100000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (n >= 100) return n.toFixed(2);
  if (n >= 1) return n.toFixed(4);
  return n.toFixed(5);
}

export function WebTradingLayout() {
  const [symbol, setSymbol] = useState("XAU/USD");
  const [posTab, setPosTab] = useState<"open" | "pending" | "closed">("open");
  const [orderTab, setOrderTab] = useState<"market" | "pending">("market");

  const active = useMemo((): Instrument => {
    const row = INSTRUMENTS.find((i) => i.sym === symbol);
    if (row) return row;
    return INSTRUMENTS.find((i) => i.sym === "XAU/USD") ?? INSTRUMENTS[0]!;
  }, [symbol]);

  return (
    <div className="flex h-dvh max-h-dvh flex-col bg-[#0f1115] text-[#e8ecf4]">
      {/* Top bar */}
      <header className="flex h-11 shrink-0 items-center gap-3 border-b border-[#2a2e39] px-2 sm:px-3">
        <Link href="/" className="shrink-0 pl-1 text-sm font-bold tracking-tight text-[#ffd700]">
          exness
        </Link>
        <div className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto sm:flex">
          {["XAU/USD", "USOIL", "BTC", "EUR/USD"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSymbol(t)}
              className={`shrink-0 rounded px-2.5 py-1 text-xs font-medium transition ${
                symbol === t
                  ? "bg-[#1a1d26] text-white"
                  : "text-[#8b95a8] hover:bg-[#1a1d26]/80 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden text-xs text-[#8b95a8] md:inline">Demo Standard</span>
          <span className="text-xs font-medium tabular-nums">10,000.00 USD</span>
          <button
            type="button"
            className="hidden rounded border border-[#ffd700] px-2.5 py-1 text-xs font-medium text-[#ffd700] transition hover:bg-[#ffd700]/10 sm:block"
          >
            Deposit
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Instruments */}
        <aside className="flex max-h-48 shrink-0 flex-col border-b border-[#2a2e39] lg:max-h-none lg:w-[220px] lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-[#2a2e39] px-2 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8b95a8]">
              Instruments
            </span>
          </div>
          <div className="border-b border-[#2a2e39] px-2 pb-2">
            <input
              type="search"
              placeholder="Search"
              className="h-8 w-full rounded border border-[#2a2e39] bg-[#14171f] px-2 text-xs text-white outline-none placeholder:text-[#6b7280] focus:border-[#3d4454]"
            />
          </div>
          <div className="min-h-0 flex-1 overflow-auto text-xs">
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-1 border-b border-[#2a2e39] px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide text-[#6b7280]">
              <span>Symbol</span>
              <span className="text-right">Bid</span>
              <span className="text-right">Ask</span>
            </div>
            {INSTRUMENTS.map((row) => (
              <button
                key={row.sym}
                type="button"
                onClick={() => setSymbol(row.sym)}
                className={`grid w-full grid-cols-[1fr_auto_auto] items-center gap-x-1 border-b border-[#1f232d] px-2 py-1.5 text-left transition hover:bg-[#1a1d26] ${
                  symbol === row.sym ? "bg-[#1a1d26] ring-1 ring-inset ring-[#ffd700]/30" : ""
                }`}
              >
                <span className="font-medium text-white">{row.sym}</span>
                <span
                  className={`rounded px-1.5 py-0.5 text-right font-mono tabular-nums ${
                    row.up ? "bg-[#1a3d2e] text-[#26c281]" : "bg-[#3d1f24] text-[#ef5350]"
                  }`}
                >
                  {fmt(row.bid)}
                </span>
                <span
                  className={`rounded px-1.5 py-0.5 text-right font-mono tabular-nums ${
                    row.up ? "bg-[#1a3d2e] text-[#26c281]" : "bg-[#3d1f24] text-[#ef5350]"
                  }`}
                >
                  {fmt(row.ask)}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* Chart + bottom */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col border-b border-[#2a2e39] lg:border-b-0">
            <div className="flex shrink-0 items-center gap-2 border-b border-[#2a2e39] px-2 py-1.5 text-[11px] text-[#8b95a8]">
              <span className="font-medium text-white">Gold vs US Dollar · 1</span>
              <span className="rounded bg-[#1a1d26] px-1.5 py-0.5">1m</span>
              <span className="hidden sm:inline">Candles</span>
              <span className="ml-auto hidden rounded border border-[#2a2e39] px-2 py-0.5 sm:inline">
                Save
              </span>
            </div>
            <div className="flex min-h-0 min-w-0 flex-1">
              <div className="hidden w-9 shrink-0 flex-col gap-0.5 border-r border-[#2a2e39] bg-[#14171f] py-1 xl:flex">
                {["+", "╱", "⌒", "T", "□", "○"].map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    className="flex h-8 items-center justify-center text-[11px] text-[#8b95a8] hover:bg-[#1f232d] hover:text-white"
                    aria-label="Drawing tool"
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="relative min-h-0 min-w-0 flex-1">
                <WebTradingChart className="absolute inset-0 h-full w-full" />
              </div>
            </div>
          </div>

          {/* Positions */}
          <div className="flex h-[38%] max-h-[280px] min-h-[160px] shrink-0 flex-col border-t border-[#2a2e39] lg:h-52 lg:max-h-none">
            <div className="flex border-b border-[#2a2e39]">
              {(
                [
                  ["open", "Open"],
                  ["pending", "Pending"],
                  ["closed", "Closed"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPosTab(id)}
                  className={`px-4 py-2 text-xs font-medium ${
                    posTab === id
                      ? "border-b-2 border-white text-white"
                      : "text-[#6b7280] hover:text-[#9ca3af]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-[#6b7280]">
              <svg
                className="h-10 w-10 opacity-30"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M4 9h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V9z" />
              </svg>
              <p className="text-sm">No open positions</p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-[#2a2e39] bg-[#14171f] px-3 py-1.5 text-[10px] text-[#8b95a8]">
              <span>
                Equity <span className="text-white tabular-nums">10,000.00 USD</span>
              </span>
              <span>
                Balance <span className="text-white tabular-nums">10,000.00 USD</span>
              </span>
              <span>
                Margin <span className="text-white tabular-nums">0.00 USD</span>
              </span>
            </div>
          </div>
        </div>

        {/* Order panel */}
        <aside className="flex w-full shrink-0 flex-col border-t border-[#2a2e39] lg:w-[260px] lg:border-l lg:border-t-0">
          <div className="border-b border-[#2a2e39] px-3 py-2 text-center text-sm font-semibold">
            {symbol}
          </div>
          <div className="grid grid-cols-2 gap-2 p-3">
            <button
              type="button"
              className="flex flex-col items-center rounded-lg bg-[#3d1f24] py-3 transition hover:brightness-110"
            >
              <span className="text-[10px] font-medium uppercase text-[#fca5a5]">Sell</span>
              <span className="mt-1 font-mono text-lg font-semibold tabular-nums text-white">
                {fmt(active.bid)}
              </span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center rounded-lg bg-[#1e3a5f] py-3 transition hover:brightness-110"
            >
              <span className="text-[10px] font-medium uppercase text-[#93c5fd]">Buy</span>
              <span className="mt-1 font-mono text-lg font-semibold tabular-nums text-white">
                {fmt(active.ask)}
              </span>
            </button>
          </div>
          <div className="mx-3 mb-3 h-2 overflow-hidden rounded-full bg-[#1f232d]">
            <div className="flex h-full w-full">
              <div className="bg-[#ef5350]" style={{ width: "64%" }} />
              <div className="bg-[#2196f3]" style={{ width: "36%" }} />
            </div>
          </div>
          <p className="px-3 pb-2 text-center text-[10px] text-[#6b7280]">64% sell · 36% buy</p>
          <div className="flex border-y border-[#2a2e39]">
            <button
              type="button"
              onClick={() => setOrderTab("market")}
              className={`flex-1 py-2 text-xs font-medium ${
                orderTab === "market" ? "border-b-2 border-white text-white" : "text-[#6b7280]"
              }`}
            >
              Market
            </button>
            <button
              type="button"
              onClick={() => setOrderTab("pending")}
              className={`flex-1 py-2 text-xs font-medium ${
                orderTab === "pending" ? "border-b-2 border-white text-white" : "text-[#6b7280]"
              }`}
            >
              Pending
            </button>
          </div>
          <div className="space-y-3 p-3 text-xs">
            <div>
              <span className="text-[#8b95a8]">Volume</span>
              <div className="mt-1 flex items-center gap-2">
                <button type="button" className="rounded border border-[#2a2e39] px-2 py-1 text-lg leading-none">
                  −
                </button>
                <span className="flex-1 rounded border border-[#2a2e39] bg-[#14171f] py-2 text-center font-mono tabular-nums">
                  0.01 Lots
                </span>
                <button type="button" className="rounded border border-[#2a2e39] px-2 py-1 text-lg leading-none">
                  +
                </button>
              </div>
            </div>
            <div className="rounded border border-[#2a2e39] bg-[#14171f] px-3 py-2 text-[#6b7280]">
              Take profit — <span className="text-white">Not set</span>
            </div>
            <div className="rounded border border-[#2a2e39] bg-[#14171f] px-3 py-2 text-[#6b7280]">
              Stop loss — <span className="text-white">Not set</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
