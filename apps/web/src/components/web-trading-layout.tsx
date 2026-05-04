"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  type ChartInterval,
  WebTradingChart,
} from "@/components/web-trading-chart";
import { postLogout, postOpenTrade } from "@/lib/api";
import { AssetSymbols, BidAskTickSchema } from "@repo/types";

type Instrument = {
  sym: AssetSymbols;
  bid: number;
  ask: number;
  up: boolean;
};

/** Stable row order in the instruments list (matches `AssetSymbols` pair). */
const TRADABLE: AssetSymbols[] = [AssetSymbols.BTC, AssetSymbols.ETH];

function initialQuotes(): Record<
  AssetSymbols,
  Pick<Instrument, "bid" | "ask" | "up">
> {
  return {
    [AssetSymbols.BTC]: { bid: 0, ask: 0, up: true },
    [AssetSymbols.ETH]: { bid: 0, ask: 0, up: true },
  };
}

function fmt(n: number) {
  if (n >= 1000 && n < 100000)
    return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (n >= 100) return n.toFixed(2);
  if (n >= 1) return n.toFixed(4);
  return n.toFixed(5);
}

/** API `asset` enum matches `AssetSymbols` values (see apps/api openTradeRequest). */
function symbolToApiAsset(sym: AssetSymbols): "BTCUSDT" | "ETHUSDT" | null {
  if (sym === AssetSymbols.BTC || sym === AssetSymbols.ETH) return sym;
  return null;
}

function displayShort(sym: AssetSymbols): string {
  return sym.replace("_USDC", "");
}

function matchesInstrumentSearch(sym: AssetSymbols, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const ticker = sym.toLowerCase();
  const base = sym.replace(/USDT$/i, "").toLowerCase();
  return ticker.includes(q) || base.includes(q);
}

export function WebTradingLayout() {
  const router = useRouter();
  const [selectedAsset, setSelectedAsset] = useState<AssetSymbols>(
    AssetSymbols.BTC,
  );
  const [quotes, setQuotes] = useState(initialQuotes);
  const [posTab, setPosTab] = useState<"open" | "closed">("open");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [margin, setMargin] = useState(100);
  const [leverage, setLeverage] = useState(10);
  const [tradeBusy, setTradeBusy] = useState(false);
  const [tradeMessage, setTradeMessage] = useState<string | null>(null);
  const [chartInterval, setChartInterval] = useState<ChartInterval>("5m");
  const [instrumentSearch, setInstrumentSearch] = useState("");

  const filteredTradable = useMemo(
    () => TRADABLE.filter((sym) => matchesInstrumentSearch(sym, instrumentSearch)),
    [instrumentSearch],
  );

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_PRICE_WS_URL ?? "ws://localhost:8080";
    const socket = new WebSocket(url);

    socket.onmessage = (event) => {
      let raw: unknown;
      try {
        raw = JSON.parse(event.data as string);
      } catch {
        return;
      }

      const parsed = BidAskTickSchema.safeParse(raw);
      if (!parsed.success) return;

      const { payload } = parsed.data;

      setQuotes((prev) => {
        const next = { ...prev };
        for (const sym of TRADABLE) {
          const tick = payload[sym];
          if (tick == null) continue;
          const { bid, ask } = tick;
          const oldBid = prev[sym].bid;
          const up = oldBid === 0 ? true : bid >= oldBid;
          next[sym] = { bid, ask, up };
        }
        return next;
      });
    };

    return () => {
      socket.close();
    };
  }, []);

  const active = useMemo((): Instrument => {
    const q = quotes[selectedAsset];
    return { sym: selectedAsset, ...q };
  }, [quotes, selectedAsset]);

  const apiAsset = useMemo(
    () => symbolToApiAsset(selectedAsset),
    [selectedAsset],
  );
  const canPlaceApiTrade = apiAsset !== null;

  async function submitOpenTrade(side: "BUY" | "SELL") {
    const asset = symbolToApiAsset(selectedAsset);
    if (!asset || tradeBusy) return;
    if (margin <= 0 || leverage <= 0) {
      setTradeMessage("Set margin and leverage.");
      return;
    }

    setTradeBusy(true);
    setTradeMessage(null);
    try {
      await postOpenTrade({
        asset,
        side,
        margin,
        leverage,
      });
      setTradeMessage("Order sent.");
    } catch (e) {
      setTradeMessage(e instanceof Error ? e.message : "Order failed");
    } finally {
      setTradeBusy(false);
    }
  }

  async function onLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await postLogout();
    } finally {
      router.replace("/login");
      router.refresh();
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="flex h-dvh max-h-dvh flex-col bg-[#0f1115] text-[#e8ecf4]">
      {/* Top bar */}
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-[#2a2e39] px-2 sm:gap-3 sm:px-3">
        <Link
          href="/"
          className="shrink-0 pl-1 text-sm font-bold tracking-tight text-[#ffd700]"
        >
          exness
        </Link>
        <div className="min-w-0 flex-1">
          <input
            type="search"
            value={instrumentSearch}
            onChange={(e) => setInstrumentSearch(e.target.value)}
            placeholder="Search instruments"
            aria-label="Search instruments"
            className="h-8 w-full max-w-md rounded border border-[#2a2e39] bg-[#14171f] px-2.5 text-xs text-white outline-none placeholder:text-[#6b7280] focus:border-[#3d4454]"
          />
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden text-xs text-[#8b95a8] md:inline">
            Demo Standard
          </span>
          <span className="text-xs font-medium tabular-nums">
            10,000.00 USD
          </span>
          <button
            type="button"
            onClick={() => void onLogout()}
            disabled={isLoggingOut}
            className="rounded border border-[#2a2e39] px-2.5 py-1 text-xs font-medium text-[#e8ecf4] transition hover:bg-[#1a1d26] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
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
          <div className="min-h-0 flex-1 overflow-auto text-xs">
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-1 border-b border-[#2a2e39] px-2 py-1.5 text-[10px] font-medium uppercase tracking-wide text-[#6b7280]">
              <span>Symbol</span>
              <span className="text-right">Bid</span>
              <span className="text-right">Ask</span>
            </div>
            {filteredTradable.length === 0 ? (
              <p className="px-2 py-4 text-center text-[11px] text-[#6b7280]">
                No instruments match your search.
              </p>
            ) : (
              filteredTradable.map((sym) => {
                const row = quotes[sym];
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => setSelectedAsset(sym)}
                    className={`grid w-full grid-cols-[1fr_auto_auto] items-center gap-x-1 border-b border-[#1f232d] px-2 py-1.5 text-left transition hover:bg-[#1a1d26] ${
                      selectedAsset === sym
                        ? "bg-[#1a1d26] ring-1 ring-inset ring-[#ffd700]/30"
                        : ""
                    }`}
                  >
                    <span className="font-medium text-white">
                      {displayShort(sym)}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-right font-mono tabular-nums ${
                        row.up
                          ? "bg-[#1a3d2e] text-[#26c281]"
                          : "bg-[#3d1f24] text-[#ef5350]"
                      }`}
                    >
                      {fmt(row.bid)}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-right font-mono tabular-nums ${
                        row.up
                          ? "bg-[#1a3d2e] text-[#26c281]"
                          : "bg-[#3d1f24] text-[#ef5350]"
                      }`}
                    >
                      {fmt(row.ask)}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Chart + bottom */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col border-b border-[#2a2e39] lg:border-b-0">
            <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[#2a2e39] px-2 py-1.5 text-[11px] text-[#8b95a8]">
              <span className="font-medium text-white">
                {selectedAsset.replace("USDT", "")} / USDT
              </span>
              <span className="flex items-center gap-1">
                {(["1m", "5m"] as const).map((iv) => (
                  <button
                    key={iv}
                    type="button"
                    onClick={() => setChartInterval(iv)}
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition ${
                      chartInterval === iv
                        ? "bg-[#1a1d26] text-white"
                        : "text-[#8b95a8] hover:bg-[#1f232d] hover:text-white"
                    }`}
                  >
                    {iv}
                  </button>
                ))}
              </span>
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
                <WebTradingChart
                  className="absolute inset-0 h-full w-full"
                  asset={selectedAsset}
                  interval={chartInterval}
                />
              </div>
            </div>
          </div>

          {/* Positions */}
          <div className="flex h-[38%] max-h-[280px] min-h-[160px] shrink-0 flex-col border-t border-[#2a2e39] lg:h-52 lg:max-h-none">
            <div className="flex border-b border-[#2a2e39]">
              {(
                [
                  ["open", "Open"],
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
                Equity{" "}
                <span className="text-white tabular-nums">10,000.00 USD</span>
              </span>
              <span>
                Balance{" "}
                <span className="text-white tabular-nums">10,000.00 USD</span>
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
            {displayShort(selectedAsset)}
          </div>
          {!canPlaceApiTrade && (
            <p className="border-b border-[#2a2e39] px-3 py-2 text-center text-[10px] leading-snug text-[#8b95a8]">
              Open trade API accepts{" "}
              <span className="text-[#e8ecf4]">BTCUSDT</span> or{" "}
              <span className="text-[#e8ecf4]">ETHUSDT</span>. Select BTC or ETH
              to place an order.
            </p>
          )}
          <div className="grid grid-cols-2 gap-2 p-3">
            <button
              type="button"
              disabled={!canPlaceApiTrade || tradeBusy}
              onClick={() => void submitOpenTrade("SELL")}
              className="flex flex-col items-center rounded-lg bg-[#3d1f24] py-3 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="text-[10px] font-medium uppercase text-[#fca5a5]">
                Sell
              </span>
              <span className="mt-1 font-mono text-lg font-semibold tabular-nums text-white">
                {fmt(active.bid)}
              </span>
            </button>
            <button
              type="button"
              disabled={!canPlaceApiTrade || tradeBusy}
              onClick={() => void submitOpenTrade("BUY")}
              className="flex flex-col items-center rounded-lg bg-[#1e3a5f] py-3 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="text-[10px] font-medium uppercase text-[#93c5fd]">
                Buy
              </span>
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
          <p className="px-3 pb-2 text-center text-[10px] text-[#6b7280]">
            64% sell · 36% buy
          </p>
          <div className="border-y border-[#2a2e39]">
            <div className="py-2 text-center text-xs font-medium text-white">
              Market
            </div>
            <p className="border-t border-[#2a2e39] px-3 py-1.5 text-center text-[10px] text-[#6b7280]">
              <span
                title="Coming soon"
                className="cursor-help underline decoration-dotted decoration-[#6b7280] underline-offset-2"
              >
                Pending order
              </span>
            </p>
          </div>
          <div className="space-y-3 p-3 text-xs">
            <div>
              <label htmlFor="order-margin" className="text-[#8b95a8]">
                Margin (USD)
              </label>
              <input
                id="order-margin"
                type="number"
                min={1}
                step={1}
                value={margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                className="mt-1 w-full rounded border border-[#2a2e39] bg-[#14171f] px-2 py-2 font-mono tabular-nums text-white outline-none focus:border-[#3d4454]"
              />
            </div>
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <label htmlFor="order-leverage" className="text-[#8b95a8]">
                  Leverage
                </label>
                <span className="font-mono text-[11px] tabular-nums text-white">
                  {leverage}×
                </span>
              </div>
              <input
                id="order-leverage"
                type="range"
                min={1}
                max={100}
                step={1}
                value={leverage}
                onChange={(e) => setLeverage(Number(e.target.value))}
                className="mt-2 w-full accent-[#ffd700]"
              />
              <input
                type="number"
                min={1}
                step={1}
                value={leverage}
                onChange={(e) =>
                  setLeverage(Math.max(1, Number(e.target.value) || 1))
                }
                className="mt-2 w-full rounded border border-[#2a2e39] bg-[#14171f] px-2 py-1.5 font-mono text-[11px] tabular-nums text-white outline-none focus:border-[#3d4454]"
              />
            </div>
            {tradeMessage && (
              <p
                className={`text-center text-[11px] ${
                  tradeMessage === "Order sent."
                    ? "text-[#26c281]"
                    : "text-[#ef5350]"
                }`}
              >
                {tradeMessage}
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
