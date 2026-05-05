# Tasks: Trading Metrics Display Consistency

**Input**: Design documents from `/specs/002-fix-trading-metrics-display/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/trading-metrics-display-contract.md`, `quickstart.md`

**Tests**: Tests are optional and were not explicitly requested in the specification. This task list uses lint/type-check plus manual verification scenarios.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no direct dependency)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`)
- Every task includes an exact file path

## Path Conventions

- Frontend-only scope: `apps/web/*`
- Feature docs: `specs/002-fix-trading-metrics-display/*`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare a safe implementation baseline in `apps/web` without changing behavior yet.

- [X] T001 Inventory all metric read/write/render touchpoints in `apps/web` and document them in `specs/002-fix-trading-metrics-display/quickstart.md`
- [X] T002 Create a feature notes file for implementation decisions in `specs/002-fix-trading-metrics-display/research.md`
- [X] T003 [P] Add a dedicated metric pipeline module scaffold in `apps/web/src/lib/tradingMetrics/snapshotPipeline.ts`
- [X] T004 [P] Add a dedicated metric formatting module scaffold in `apps/web/src/lib/tradingMetrics/formatting.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build core primitives that all stories depend on.

**⚠️ CRITICAL**: No user story work starts before this phase is complete.

- [X] T005 Define canonical snapshot and freshness types in `apps/web/src/lib/tradingMetrics/types.ts`
- [X] T006 Implement snapshot completeness and atomic publish guards in `apps/web/src/lib/tradingMetrics/snapshotPipeline.ts`
- [X] T007 Implement shared two-decimal metric formatter and canonical rounding strategy in `apps/web/src/lib/tradingMetrics/formatting.ts`
- [X] T008 Implement stale-timer state helper with 10-second threshold and grey-only mode in `apps/web/src/lib/tradingMetrics/freshness.ts`
- [X] T009 Create metric selector adapters bound to snapshot version in `apps/web/src/lib/tradingMetrics/selectors.ts`

**Checkpoint**: Foundational metric primitives are complete and reusable by all stories.

---

## Phase 3: User Story 1 - Accurate live account values while trading (Priority: P1) 🎯 MVP

**Goal**: Ensure PnL/balance/equity/used-margin/remaining-margin are mathematically correct and rendered from a single complete snapshot.

**Independent Test**: Open one or more trades and confirm every tick produces internally consistent metric values with no mixed-cycle combinations.

### Implementation for User Story 1

- [X] T010 [P] [US1] Wire tick + trade lifecycle recomputation into snapshot publisher in `apps/web/src/lib/tradingMetrics/snapshotPipeline.ts`
- [X] T011 [US1] Update trading account aggregation logic to emit complete snapshots only in `apps/web/src/lib/tradingMetrics/selectors.ts`
- [X] T012 [US1] Integrate atomic snapshot consumption in the trading metrics panel component in `apps/web/src/components/trading/TradingMetricsPanel.tsx`
- [X] T013 [P] [US1] Integrate atomic snapshot consumption in account summary component in `apps/web/src/components/account/AccountSummary.tsx`
- [X] T014 [US1] Prevent rendering of incomplete metric cycles in shared metric hooks in `apps/web/src/lib/tradingMetrics/useTradingMetrics.ts`
- [X] T015 [US1] Document US1 manual verification steps and expected formula checks in `specs/002-fix-trading-metrics-display/quickstart.md`

**Checkpoint**: User Story 1 is independently functional and mathematically consistent.

---

## Phase 4: User Story 2 - Stable values during fast tick bursts (Priority: P2)

**Goal**: Keep metrics synchronized and coherent under high-frequency updates across all visible metric surfaces.

**Independent Test**: Simulate rapid ticks and verify final rendered values are synchronized across trading/account components without contradictory states.

### Implementation for User Story 2

- [X] T016 [US2] Add burst-safe snapshot version reconciliation logic in `apps/web/src/lib/tradingMetrics/snapshotPipeline.ts`
- [X] T017 [P] [US2] Ensure cross-surface version binding in trading widgets in `apps/web/src/components/trading/TradingMetricsPanel.tsx`
- [X] T018 [P] [US2] Ensure cross-surface version binding in account widgets in `apps/web/src/components/account/AccountSummary.tsx`
- [X] T019 [US2] Add guard against stale widget-level local overrides in `apps/web/src/lib/tradingMetrics/selectors.ts`
- [X] T020 [US2] Capture high-frequency manual verification procedure and pass criteria in `specs/002-fix-trading-metrics-display/quickstart.md`

**Checkpoint**: User Stories 1 and 2 both work independently and remain consistent under bursty updates.

---

## Phase 5: User Story 3 - Clear behavior when live data is delayed (Priority: P3)

**Goal**: Apply clarified stale UX: grey metric state after 10 seconds without complete snapshot, no toast/popup messaging.

**Independent Test**: Pause feed >10s and verify grey stale state appears with no toast; on feed recovery, stale state clears and values reconcile.

### Implementation for User Story 3

- [X] T021 [US3] Implement stale transition trigger at 10 seconds in `apps/web/src/lib/tradingMetrics/freshness.ts`
- [X] T022 [US3] Apply grey stale visual treatment for targeted metrics in `apps/web/src/components/trading/TradingMetricsPanel.tsx`
- [X] T023 [P] [US3] Apply grey stale visual treatment for targeted metrics in `apps/web/src/components/account/AccountSummary.tsx`
- [X] T024 [US3] Remove/disable stale toast or popup emission paths in `apps/web/src/lib/tradingMetrics/useTradingMetrics.ts`
- [X] T025 [US3] Document stale behavior verification matrix and recovery expectations in `specs/002-fix-trading-metrics-display/quickstart.md`

**Checkpoint**: All three user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality, consistency, and release readiness checks across stories.

- [X] T026 [P] Normalize shared formatting usage across all targeted metric renderers in `apps/web/src/lib/tradingMetrics/formatting.ts`
- [X] T027 Run lint for web app and fix resulting issues in `apps/web/package.json`
- [X] T028 Run type-check for web app and fix resulting issues in `apps/web/package.json`
- [ ] T029 Execute full manual verification matrix and record outcomes in `specs/002-fix-trading-metrics-display/quickstart.md`
- [X] T030 Update feature progress and final handoff notes in `specs/002-fix-trading-metrics-display/plan.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: starts immediately
- **Phase 2 (Foundational)**: depends on Phase 1, blocks all user stories
- **Phase 3 (US1)**: depends on Phase 2, defines MVP
- **Phase 4 (US2)**: depends on Phase 2 and can proceed after US1 is stable
- **Phase 5 (US3)**: depends on Phase 2 and can proceed after US1 baseline integration
- **Phase 6 (Polish)**: depends on completion of desired user stories

### User Story Dependencies

- **US1 (P1)**: no dependency on other stories once foundational work is complete
- **US2 (P2)**: reuses US1 snapshot pipeline primitives but remains independently testable
- **US3 (P3)**: reuses freshness primitives and remains independently testable

### Within Each User Story

- Shared pipeline/hook logic before component-specific integrations
- Component integrations before manual verification documentation
- Story checkpoint must pass before moving to lower-priority rollout

### Parallel Opportunities

- Phase 1: T003 and T004
- Phase 3: T010 and T013
- Phase 4: T017 and T018
- Phase 5: T023 can run after T021 baseline
- Phase 6: T026 can run alongside lint/type-check preparation

---

## Parallel Example: User Story 2

```bash
Task: "T017 [US2] Ensure cross-surface version binding in trading widgets in apps/web/src/components/trading/TradingMetricsPanel.tsx"
Task: "T018 [US2] Ensure cross-surface version binding in account widgets in apps/web/src/components/account/AccountSummary.tsx"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1 and Phase 2.
2. Deliver Phase 3 (US1) for accurate and atomic metric correctness.
3. Validate US1 independently using its manual criteria.

### Incremental Delivery

1. Add US2 for high-frequency stability.
2. Add US3 for stale-state behavior and recovery clarity.
3. Finish with Phase 6 lint/type-check/manual matrix and handoff notes.

### Parallel Team Strategy

1. One developer owns pipeline/freshness primitives.
2. One developer updates trading metric surface.
3. One developer updates account summary surface.
4. Merge per-story checkpoints and run final cross-cutting validation.

---

## Notes

- All tasks follow the required checklist format with IDs and exact paths.
- `[P]` tasks are scoped to different files or non-blocking doc updates.
- No automated test tasks are included because tests were not explicitly requested.
