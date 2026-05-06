# Research: Trading Metrics Display Consistency

## Decision 1: Atomic snapshot rendering model

- **Decision**: Render all targeted metrics only from a complete, versioned account snapshot; reject partial-cycle payloads for display.
- **Rationale**: Prevents contradictory combinations (for example, new PnL with old equity) that break trader trust.
- **Alternatives considered**:
  - Per-field streaming updates: rejected because brief out-of-sync states are visible to users.
  - Per-widget independent state: rejected due to high drift risk across panels.

## Decision 2: Missing/late data behavior

- **Decision**: Keep the last known complete snapshot when the current cycle is incomplete and mark stale only after 10 seconds without a complete snapshot.
- **Rationale**: Matches clarified behavior and protects continuity while still signaling data freshness risk.
- **Alternatives considered**:
  - Immediate stale on first missed field: rejected due to noisy false positives in bursty conditions.
  - 2-5 second stale threshold: rejected because clarified requirement specifies 10 seconds.

## Decision 3: Stale visual communication

- **Decision**: Represent stale state with greyed metric visuals only; do not show toasts/popups for stale transitions.
- **Rationale**: Maintains low cognitive load in high-frequency trading screens and aligns with explicit clarification.
- **Alternatives considered**:
  - Toast-based stale notifications: rejected due to alert fatigue.
  - Banner/modal interruptions: rejected because they distract from active decision-making.

## Decision 4: Precision and rounding policy

- **Decision**: Display PnL, balance, equity, used margin, and remaining margin to two decimal places using one shared rounding mode in all surfaces.
- **Rationale**: Eliminates cross-widget formatting drift and ensures predictable value comparison.
- **Alternatives considered**:
  - Dynamic precision by magnitude: rejected due to visual instability and comparison friction.
  - Different rounding rules per widget: rejected as a consistency risk.

## Decision 5: Recalculation triggers

- **Decision**: Recompute and republish the account snapshot on every market tick impacting open positions and on trade lifecycle transitions (open/close/partial/SL/TP).
- **Rationale**: Ensures account-level metrics remain coherent under both price movement and position state changes.
- **Alternatives considered**:
  - Tick-only updates: rejected because trade lifecycle changes can materially alter margin/equity.
  - Time-batched recomputation only: rejected because it can lag critical risk values.

## Decision 6: Scope containment and handoff policy

- **Decision**: Limit implementation to `apps/web` value-flow and rendering logic; document non-frontend discrepancies as handoffs.
- **Rationale**: Constitution requires frontend-only scope unless explicitly authorized otherwise.
- **Alternatives considered**:
  - Cross-service fixes in same feature: rejected due to scope violation risk.

## Implementation Notes

- Added canonical trading metrics pipeline modules under `apps/web/src/lib/tradingMetrics`.
- Introduced shared metric presentation components:
  - `apps/web/src/components/trading/TradingMetricsPanel.tsx`
  - `apps/web/src/components/account/AccountSummary.tsx`
- Removed stale-status message surface in favor of silent greyed metrics after threshold.
