# Contract: Trading Metrics Display Consistency

## Purpose

Define enforceable frontend contracts for computing and presenting live trading metrics consistently in `apps/web`.

## Contract 1: Atomic Snapshot Source of Truth

- All targeted metrics (`PnL`, `balance`, `equity`, `used margin`, `remaining margin`) MUST render from one complete snapshot version.
- Partial or incomplete update cycles MUST NOT be rendered as a new displayed state.
- If a cycle is incomplete, UI MUST continue showing the previous complete snapshot.

## Contract 2: Snapshot Freshness and Stale Transition

- Frontend MUST track time since last complete snapshot arrival.
- If no complete snapshot arrives for 10 seconds, UI MUST mark targeted metrics stale.
- Stale transition MUST be visual-only (greyed metrics) and MUST NOT emit toast/popup alerts.
- When a complete snapshot arrives, stale state MUST clear in the next render cycle.

## Contract 3: Metric Recalculation Triggers

- Snapshot recomputation/publish MUST occur for:
  - Relevant market tick updates affecting open positions.
  - Trade lifecycle changes (open, close, partial close, stop-loss, take-profit).
- Aggregated account values MUST remain internally coherent for every published snapshot.

## Contract 4: Formatting and Precision Consistency

- PnL, balance, equity, used margin, and remaining margin MUST use:
  - Exactly 2 decimal places.
  - One shared rounding mode.
- All components displaying these metrics MUST use shared formatting utilities/rules, not local overrides.

## Contract 5: Cross-Surface Consistency

- Any concurrent UI surfaces showing the targeted metrics MUST display identical values for the same snapshot version.
- No widget may lag on an older snapshot version once a newer complete snapshot is published for the view state.

## Contract 6: Verification Requirements

- Manual verification MUST confirm:
  - Single-position and multi-position accuracy under normal ticks.
  - Consistent cross-surface values under bursty updates.
  - Proper stale transition at 10 seconds with grey-only visual state.
  - Correct reconciliation after delayed feed recovery.
  - Correct recomputation after trade lifecycle transitions.
