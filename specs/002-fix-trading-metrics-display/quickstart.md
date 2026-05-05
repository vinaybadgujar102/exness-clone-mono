# Quickstart: Trading Metrics Consistency Implementation

## 1) Confirm scope and current frontend metric flow

1. Work only inside `apps/web`.
2. Inventory where PnL, balance, equity, used margin, and remaining margin are:
   - Computed or transformed.
   - Stored/selectively cached.
   - Rendered across components.

### Touchpoint Inventory (2026-05-05)

- Computation and publish pipeline:
  - `apps/web/src/lib/tradingMetrics/snapshotPipeline.ts`
  - `apps/web/src/lib/tradingMetrics/useTradingMetrics.ts`
- Formatting and precision:
  - `apps/web/src/lib/tradingMetrics/formatting.ts`
- Snapshot selectors and freshness:
  - `apps/web/src/lib/tradingMetrics/selectors.ts`
  - `apps/web/src/lib/tradingMetrics/freshness.ts`
- Render surfaces:
  - `apps/web/src/components/trading/TradingMetricsPanel.tsx`
  - `apps/web/src/components/account/AccountSummary.tsx`
  - `apps/web/src/components/web-trading-layout.tsx`

## 2) Establish canonical snapshot pipeline

1. Define/align one complete account metric snapshot structure.
2. Add snapshot version and capture timestamp metadata.
3. Ensure publish step only emits complete snapshots.

## 3) Enforce atomic rendering

1. Refactor metric consumers to bind to one snapshot version per render.
2. Prevent per-field independent updates from reaching user-visible metric widgets.
3. Preserve last complete snapshot whenever the next cycle is incomplete.

## 4) Implement stale behavior

1. Track last complete snapshot timestamp.
2. If 10 seconds pass without a new complete snapshot:
   - Mark metrics stale.
   - Render targeted metrics in grey style.
   - Do not emit toast/popup alerts.
3. Clear stale flag once a new complete snapshot is rendered.

## 5) Standardize precision and rounding

1. Route all targeted metrics through a shared formatter.
2. Apply two decimal places for PnL, balance, equity, used margin, and remaining margin.
3. Use one canonical rounding mode everywhere.

## 6) Validate trade-driven updates

1. Verify updates on:
   - Tick-driven price changes.
   - Trade open/close/partial close.
   - Stop-loss / take-profit execution.
2. Confirm account-level metrics remain coherent for each published snapshot.

## 7) Manual verification matrix

1. Single open trade with normal tick cadence.
2. Multi-position portfolio across symbols.
3. High-frequency tick burst (no contradictory cross-widget values).
4. Feed pause >10s (grey stale state, no toast).
5. Feed recovery (stale clears, latest snapshot reconciles correctly).
6. Trade lifecycle change during active ticks.

### Story-specific checks

- US1 checks:
  - Verify one complete snapshot version drives both header and footer metric values.
  - Verify displayed balance/equity/used margin/remaining margin remain internally consistent.
- US2 checks:
  - Simulate bursty ticks and confirm no mixed-version metric rendering across surfaces.
- US3 checks:
  - Pause complete snapshot updates for >10 seconds and confirm metrics grey out silently.
  - Resume updates and confirm stale visual clears after next complete snapshot publish.

## 8) Quality checks

From `apps/web`:

1. Run lint.
2. Run type-check.
3. Resolve all issues introduced by the feature.

## 9) Done criteria

- All targeted metric surfaces render from atomic snapshots only.
- Stale behavior exactly matches clarified UX (10 seconds, grey only, no toast).
- Precision and rounding are consistent across all targeted metric components.
- Manual verification scenarios pass without critical discrepancies.
