# Implementation Plan: Trading Metrics Display Consistency

**Branch**: `002-currently-guess-vlaues` | **Date**: 2026-05-05 | **Spec**: `specs/002-fix-trading-metrics-display/spec.md`  
**Input**: Feature specification from `specs/002-fix-trading-metrics-display/spec.md`

## Summary

Ensure live trading account metrics in `apps/web` remain mathematically correct and visually consistent by enforcing atomic snapshot rendering, 10-second stale greying behavior (without toasts), and deterministic 2-decimal rounding across PnL, balance, equity, and margin values.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19.2, Next.js 15.5  
**Primary Dependencies**: Existing `apps/web` stack (including `@tanstack/react-query` and `zustand` where currently used), no new dependency required for this feature  
**Storage**: N/A (in-memory UI/view state and existing server-fed data streams)  
**Testing**: Optional (not requested); lint + type-check + focused manual trading metric verification  
**Target Platform**: Web browser via Next.js app in `apps/web`  
**Project Type**: Frontend web application  
**Performance Goals**: Preserve readable real-time updates under bursty ticks while maintaining synchronized account metrics per refresh cycle  
**Constraints**: Strictly `apps/web` scope; no backend/trade-engine/shared package edits in this feature; no intrusive stale alerts; stale transition at 10s  
**Scale/Scope**: Trading screens and shared frontend metric presentation layers that show live PnL/balance/equity/used margin/remaining margin

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Scope (`apps/web` only)**: PASS. Plan targets frontend calculations/presentation only; any backend mismatch discovered becomes handoff.
- **Clean typed React architecture**: PASS. Plan favors small typed adapters/selectors and centralized display rule utilities.
- **Exness-style simple UX**: PASS. Non-intrusive grey stale state and synchronized values reduce cognitive load.
- **Dependency audit first**: PASS. No new packages required; existing stack is sufficient.
- **Preferred state stack alignment**: PASS. Existing `@tanstack/react-query` and `zustand` usage remains the baseline where applicable.
- **Testing policy**: PASS. No mandatory automated tests introduced; manual verification matrix included.

No constitutional violations.

## Phase 0: Research Outcomes

Research documented in `specs/002-fix-trading-metrics-display/research.md` with decisions on:
- Atomic snapshot publication and render gating.
- Stale detection behavior and presentation pattern.
- Deterministic metric precision/rounding strategy.
- Failure and reconciliation behavior during rapid ticks and trade lifecycle changes.

## Phase 1: Design & Contracts

Design artifacts:
- `specs/002-fix-trading-metrics-display/data-model.md`
- `specs/002-fix-trading-metrics-display/contracts/trading-metrics-display-contract.md`
- `specs/002-fix-trading-metrics-display/quickstart.md`

Design direction:
- Introduce a canonical frontend account snapshot shape for display-time consistency.
- Enforce atomic render guardrails so all metric widgets consume one snapshot version.
- Add stale-state transition policy: 10 seconds without complete snapshot -> grey metrics, no toast.
- Centralize formatting: two-decimal display with one rounding mode for all targeted metrics.
- Include reconciliation rules for rapid ticks and trade open/close transitions.

## Phase 2: Implementation Planning

1. Inventory all `apps/web` components/hooks/selectors showing targeted metrics.
2. Define/align a single account snapshot mapper and timestamp/version semantics.
3. Refactor consuming UI surfaces to render only complete snapshot versions.
4. Add stale detection timer and grey presentation behavior without toast/popup.
5. Consolidate metric formatting to shared precision/rounding utility.
6. Validate against manual scenarios: single/multi-position, fast ticks, delayed feed, trade lifecycle transitions.
7. Run lint/type-check for `apps/web` and resolve issues before task closeout.

Rollback strategy:
- Keep changes grouped by metric pipeline and UI surface.
- If regression occurs, revert affected display adapter/surface while retaining non-breaking utilities.

## Project Structure

### Documentation (this feature)

```text
specs/002-fix-trading-metrics-display/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── trading-metrics-display-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/
├── web/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── services/
│   └── stores/
├── api/
├── trade-engine/
└── price-poller/

packages/
└── types/
```

**Structure Decision**: Implement only in `apps/web` metric data-flow and rendering layers; do not modify `apps/api`, `apps/trade-engine`, `apps/price-poller`, or `packages/types` for this feature.

## Post-Design Constitution Check

- Scope boundary remains `apps/web` only: PASS  
- Typed architecture and simple abstractions preserved: PASS  
- UX clarity target upheld (grey stale, no noisy alerts): PASS  
- Dependency strategy unchanged and justified: PASS  
- Testing policy respected (optional tests): PASS

## Complexity Tracking

No constitutional violations requiring justification.

## Implementation Progress Notes

- Introduced `apps/web/src/lib/tradingMetrics/*` modules for snapshot construction, freshness, selectors, and formatting.
- Wired `apps/web/src/components/web-trading-layout.tsx` to consume atomic snapshots via `useTradingMetrics`.
- Added dedicated render surfaces for cross-surface binding:
  - `apps/web/src/components/trading/TradingMetricsPanel.tsx`
  - `apps/web/src/components/account/AccountSummary.tsx`
- Stale UX now relies on greyed metric values after threshold without toast/popup messaging.
