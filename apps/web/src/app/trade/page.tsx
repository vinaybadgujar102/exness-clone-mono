import Link from "next/link";

import { TradeTerminal } from "@/components/trade-terminal";

export default function TradePage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--color-surface-0)]">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface-1)] px-3 sm:px-4">
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Clone terminal
          </span>
        </div>
        <nav className="flex items-center gap-2 text-xs">
          <Link
            href="/"
            className="rounded px-2 py-1 text-[var(--color-muted)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-foreground)]"
          >
            Home
          </Link>
          <Link
            href="/login"
            className="rounded px-2 py-1 text-[var(--color-muted)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-foreground)]"
          >
            Account
          </Link>
        </nav>
      </header>
      <TradeTerminal />
    </div>
  );
}
