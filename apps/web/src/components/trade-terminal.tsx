"use client";

import { AssetSymbols } from "@repo/types";
import { useMemo, useState } from "react";

import { postCloseTrade, postOpenTrade } from "@/lib/api";

const ASSETS = [AssetSymbols.BTC, AssetSymbols.ETH] as const;

function labelPair(symbol: AssetSymbols): string {
  if (symbol === AssetSymbols.BTC) return "BTC / USDC";
  if (symbol === AssetSymbols.ETH) return "ETH / USDC";
  return symbol;
}

export function TradeTerminal() {
  const [asset, setAsset] = useState<AssetSymbols>(AssetSymbols.BTC);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [leverage, setLeverage] = useState(10);
  const [margin, setMargin] = useState(100);
  const [quantity, setQuantity] = useState(0.01);
  const [tradeId, setTradeId] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<string | null>(null);

  const chartBars = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        h: 20 + ((i * 17) % 55),
        up: i % 4 !== 0,
      })),
    [],
  );

  async function submitOpen() {
    setBusy(true);
    setNote(null);
    setLastPayload(null);
    try {
      const res = await postOpenTrade({
        asset,
        quantity,
        margin,
        side,
        leverage,
      });
      setLastPayload(JSON.stringify(res.raw ?? res.envelope, null, 2));
      const p = res.envelope?.payload;
      if (p?.success) {
        setNote(`Order accepted — ${p.message}. Engine uses live prices from the poller.`);
      } else {
        setNote(
          p?.message
            ? `Engine: ${p.message}`
            : `HTTP ${res.status} — see raw response below.`,
        );
      }
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  async function submitClose() {
    if (!tradeId.trim()) {
      setNote("Enter a trade ID to close (UUID from the API / engine).");
      return;
    }
    setBusy(true);
    setNote(null);
    setLastPayload(null);
    try {
      const res = await postCloseTrade(tradeId.trim());
      setLastPayload(JSON.stringify(res.raw ?? res.envelope, null, 2));
      const p = res.envelope?.payload;
      if (p?.success) {
        setNote(`Closed — ${p.message}`);
      } else {
        setNote(
          p?.message
            ? `Engine: ${p.message}`
            : `HTTP ${res.status} — see raw response below.`,
        );
      }
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <aside className="flex w-full shrink-0 flex-col border-b border-[var(--color-border)] bg-[var(--color-surface-1)] lg:w-52 lg:border-b-0 lg:border-r">
        <div className="border-b border-[var(--color-border)] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
          Watchlist
        </div>
        <div className="flex gap-1 p-2 lg:flex-col">
          {ASSETS.map((sym) => (
            <button
              key={sym}
              type="button"
              onClick={() => setAsset(sym)}
              className={`rounded-md px-3 py-2 text-left text-sm font-medium transition lg:w-full ${
                asset === sym
                  ? "bg-[var(--color-surface-3)] text-[var(--color-foreground)] ring-1 ring-[var(--color-accent)]/40"
                  : "text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-foreground)]"
              }`}
            >
              {labelPair(sym)}
            </button>
          ))}
        </div>
        <div className="mt-auto hidden border-t border-[var(--color-border)] p-3 text-[10px] leading-relaxed text-[var(--color-muted)] lg:block">
          Streams: <span className="font-mono">PRICE_TICK</span> on Redis when{" "}
          <code className="rounded bg-[var(--color-surface-2)] px-1">
            price-poller
          </code>{" "}
          runs. Chart is illustrative until a live feed is wired.
        </div>
      </aside>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col border-b border-[var(--color-border)] lg:border-b-0">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-1)] px-3 py-2 sm:px-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted)]">
              {labelPair(asset)}
            </p>
            <p className="font-mono text-lg font-semibold tabular-nums">
              —{" "}
              <span className="text-sm font-normal text-[var(--color-muted)]">
                live mid from engine
              </span>
            </p>
          </div>
          <div className="flex gap-2 font-mono text-xs">
            <span className="rounded bg-[color-mix(in_oklab,var(--color-up)_18%,transparent)] px-2 py-1 text-[var(--color-up)]">
              Buy
            </span>
            <span className="rounded bg-[color-mix(in_oklab,var(--color-down)_18%,transparent)] px-2 py-1 text-[var(--color-down)]">
              Sell
            </span>
          </div>
        </div>
        <div className="relative min-h-[220px] flex-1 bg-[var(--color-surface-0)] sm:min-h-[320px]">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
          <div className="absolute inset-x-0 bottom-8 flex h-40 items-end justify-center gap-px px-6 sm:h-48">
            {chartBars.map((b, i) => (
              <div
                key={i}
                className="w-1.5 min-w-0 flex-1 rounded-t-sm transition-all"
                style={{
                  height: `${b.h}%`,
                  backgroundColor: b.up
                    ? "color-mix(in oklab, var(--color-up) 75%, transparent)"
                    : "color-mix(in oklab, var(--color-down) 75%, transparent)",
                }}
              />
            ))}
          </div>
          <p className="absolute bottom-3 left-3 right-3 text-center text-[10px] text-[var(--color-muted)]">
            Illustrative candles — wire WebSocket or REST from your stack when
            ready.
          </p>
        </div>
      </section>

      <aside className="w-full shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface-1)] lg:w-[300px] lg:border-l lg:border-t-0">
        <div className="border-b border-[var(--color-border)] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
          New order
        </div>
        <div className="space-y-4 p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-[var(--color-surface-0)] p-1">
            <button
              type="button"
              onClick={() => setSide("BUY")}
              className={`rounded-md py-2 text-sm font-semibold transition ${
                side === "BUY"
                  ? "bg-[var(--color-up)] text-[#062015]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              }`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setSide("SELL")}
              className={`rounded-md py-2 text-sm font-semibold transition ${
                side === "SELL"
                  ? "bg-[var(--color-down)] text-[#2b0a0a]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              }`}
            >
              Sell
            </button>
          </div>

          <label className="block text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted)]">
            Leverage
            <input
              type="number"
              min={1}
              max={500}
              value={leverage}
              onChange={(e) => setLeverage(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-0)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--color-accent-dim)]"
            />
          </label>
          <label className="block text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted)]">
            Margin
            <input
              type="number"
              min={0}
              step={0.01}
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-0)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--color-accent-dim)]"
            />
          </label>
          <label className="block text-[10px] font-medium uppercase tracking-wider text-[var(--color-muted)]">
            Quantity (validated)
            <input
              type="number"
              min={0}
              step={0.0001}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-0)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--color-accent-dim)]"
            />
          </label>

          <button
            type="button"
            disabled={busy}
            onClick={() => void submitOpen()}
            className="w-full rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-40"
            style={{
              backgroundColor:
                side === "BUY" ? "var(--color-up)" : "var(--color-down)",
              color: side === "BUY" ? "#062015" : "#2b0a0a",
            }}
          >
            {busy ? "Sending…" : `Place ${side}`}
          </button>

          <div className="border-t border-[var(--color-border)] pt-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              Close position
            </p>
            <p className="mt-1 text-[10px] text-[var(--color-muted)]">
              The API does not return the new trade id in the JSON body yet;
              paste the UUID your stack logs when debugging.
            </p>
            <input
              type="text"
              value={tradeId}
              onChange={(e) => setTradeId(e.target.value)}
              placeholder="Trade UUID"
              className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-0)] px-3 py-2 font-mono text-xs outline-none focus:border-[var(--color-accent-dim)]"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => void submitClose()}
              className="mt-2 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] py-2 text-sm font-medium text-[var(--color-foreground)] transition hover:bg-[var(--color-surface-3)] disabled:opacity-40"
            >
              Close by id
            </button>
          </div>

          {note && (
            <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-0)] p-2 text-xs text-[var(--color-muted)]">
              {note}
            </p>
          )}
          {lastPayload && (
            <details className="text-xs">
              <summary className="cursor-pointer text-[var(--color-accent)]">
                Last API payload
              </summary>
              <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-[#0a0c10] p-2 font-mono text-[10px] leading-relaxed text-[var(--color-muted)]">
                {lastPayload}
              </pre>
            </details>
          )}
        </div>
      </aside>
    </div>
  );
}
