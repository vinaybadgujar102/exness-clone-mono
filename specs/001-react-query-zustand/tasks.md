# Tasks: React Query + Zustand Migration

**Input**: Design documents from `specs/001-react-query-zustand/`  
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/state-management-contract.md`, `quickstart.md`

**Tests**: Tests were not explicitly requested in the feature specification; this task list focuses on implementation plus lint/type-check and manual verification.

**Organization**: Tasks are grouped by user story so each story remains independently implementable and verifiable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no direct dependency)
- **[Story]**: User story mapping label (`[US1]`, `[US2]`, `[US3]`)
- All tasks include explicit file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add core dependencies and baseline directory structure for migration.

- [X] T001 Add `@tanstack/react-query` and `zustand` dependencies in `apps/web/package.json`
- [X] T002 Create query and store directories with README usage notes in `apps/web/src/lib/query/README.md` and `apps/web/src/stores/README.md`
- [X] T003 [P] Create migration tracker checklist for active screens in `specs/001-react-query-zustand/migration-screen-matrix.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build shared state foundations that block all story implementation.

**CRITICAL**: No user story migration starts before this phase completes.

- [X] T004 Create query client configuration with retry/backoff defaults in `apps/web/src/lib/query/query-client.ts`
- [X] T005 [P] Create canonical query key factory in `apps/web/src/lib/query/query-keys.ts`
- [X] T006 [P] Create stale-state and conflict-notice UI primitives in `apps/web/src/components/state/stale-indicator.tsx` and `apps/web/src/components/state/conflict-notice.tsx`
- [X] T007 Integrate `QueryClientProvider` at app root in `apps/web/src/app/layout.tsx`
- [X] T008 Create root Zustand store barrel and shared typing helpers in `apps/web/src/stores/index.ts` and `apps/web/src/stores/types.ts`
- [X] T009 [P] Add state ownership guidelines document for developers in `apps/web/src/lib/state-ownership-guidelines.md`
- [X] T010 Add frontend migration runtime toggles (if needed) in `apps/web/src/lib/query/migration-config.ts`

**Checkpoint**: Foundation complete, story-specific migrations can start.

---

## Phase 3: User Story 1 - Reliable Server Data Fetching (Priority: P1) 🎯 MVP

**Goal**: Ensure server-backed data flows are query-managed with consistent loading/error/stale/retry behavior.

**Independent Test**: Open each migrated server-data screen and confirm loading, recoverable retry, stale indicator, and manual refresh behavior without page reload.

### Implementation for User Story 1

- [X] T011 [US1] Refactor API fetch wrappers for query compatibility in `apps/web/src/lib/api.ts`
- [X] T012 [P] [US1] Add query hooks for web trading data in `apps/web/src/lib/query/use-webtrading-queries.ts`
- [X] T013 [P] [US1] Add query hooks for auth/session profile data in `apps/web/src/lib/query/use-auth-queries.ts`
- [X] T014 [US1] Migrate web trading page data loading to React Query in `apps/web/src/app/webtrading/page.tsx`
- [X] T015 [US1] Migrate chart data loading and refresh behavior to React Query in `apps/web/src/components/web-trading-chart.tsx`
- [X] T016 [US1] Apply standardized loading/empty/error states in `apps/web/src/components/web-trading-layout.tsx`
- [X] T017 [US1] Migrate login page server data dependencies to query hooks in `apps/web/src/app/login/page.tsx`
- [X] T018 [US1] Migrate auth callback server interactions to query/mutation pattern in `apps/web/src/app/auth/callback/page.tsx`
- [X] T019 [US1] Add stale indicator + manual refresh UX to trading flows in `apps/web/src/components/web-trading-layout.tsx`
- [X] T020 [US1] Register mutation-driven invalidation rules in `apps/web/src/lib/query/invalidation-rules.ts`
- [X] T021 [US1] Update migration matrix status for US1 screens in `specs/001-react-query-zustand/migration-screen-matrix.md`

**Checkpoint**: User Story 1 is independently functional and manually verifiable.

---

## Phase 4: User Story 2 - Predictable Client State Handling (Priority: P2)

**Goal**: Standardize shared UI/session state into typed Zustand slices with session-only scope.

**Independent Test**: Update shared UI state, navigate across relevant screens, and confirm values persist in-session but reset after browser restart.

### Implementation for User Story 2

- [X] T022 [P] [US2] Create web trading shared UI slice in `apps/web/src/stores/webtrading-ui-store.ts`
- [X] T023 [P] [US2] Create auth/login shared UI slice in `apps/web/src/stores/auth-ui-store.ts`
- [X] T024 [US2] Replace ad hoc shared state usage in `apps/web/src/components/store-login-next.tsx` with Zustand slice access
- [X] T025 [US2] Refactor login form shared UI behavior to Zustand in `apps/web/src/components/login-form.tsx`
- [X] T026 [US2] Refactor web trading layout shared controls to Zustand in `apps/web/src/components/web-trading-layout.tsx`
- [X] T027 [US2] Add session-scope reset handling helper in `apps/web/src/stores/session-reset.ts`
- [X] T028 [US2] Ensure no server-authoritative data is stored in local slices by documenting exclusions in `apps/web/src/stores/README.md`
- [X] T029 [US2] Update migration matrix status for US2 state slices in `specs/001-react-query-zustand/migration-screen-matrix.md`

**Checkpoint**: User Story 2 behavior is independently functional and session-scope rules are verified.

---

## Phase 5: User Story 3 - Clear Ownership Between Remote and Local State (Priority: P3)

**Goal**: Enforce explicit ownership boundaries and server-wins conflict handling across migrated screens.

**Independent Test**: Validate a conflict scenario where server data changed during local editing and confirm server data wins, local conflict draft is discarded, and user sees notice.

### Implementation for User Story 3

- [X] T030 [P] [US3] Create ownership classification map for active concerns in `apps/web/src/lib/state-ownership-map.ts`
- [X] T031 [US3] Wire ownership map into query/store modules in `apps/web/src/lib/query/query-keys.ts` and `apps/web/src/stores/types.ts`
- [X] T032 [US3] Implement server-wins conflict resolver utility in `apps/web/src/lib/query/conflict-resolution.ts`
- [X] T033 [US3] Integrate conflict notice flow in `apps/web/src/components/state/conflict-notice.tsx` and `apps/web/src/components/web-trading-layout.tsx`
- [X] T034 [US3] Apply conflict resolution on auth callback and login interactions in `apps/web/src/app/auth/callback/page.tsx` and `apps/web/src/app/login/page.tsx`
- [X] T035 [US3] Add developer-facing ownership examples in `apps/web/src/lib/state-ownership-guidelines.md`
- [X] T036 [US3] Update migration matrix status for ownership compliance in `specs/001-react-query-zustand/migration-screen-matrix.md`

**Checkpoint**: User Story 3 independently validates ownership clarity and conflict behavior.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency checks across all user stories.

- [X] T037 [P] Run lint for frontend app and fix issues in `apps/web` via `npm run lint`
- [X] T038 [P] Run type checks for frontend app and fix issues in `apps/web` via `npm run check-types`
- [X] T039 Execute full manual verification matrix and capture results in `specs/001-react-query-zustand/quickstart-validation-notes.md`
- [X] T040 Finalize migration screen matrix and mark all active screens complete in `specs/001-react-query-zustand/migration-screen-matrix.md`
- [X] T041 Update feature docs with final rollout notes in `specs/001-react-query-zustand/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Starts immediately
- **Phase 2 (Foundational)**: Depends on Phase 1; blocks all user stories
- **Phase 3 (US1)**: Depends on Phase 2; recommended MVP cut
- **Phase 4 (US2)**: Depends on Phase 2; can proceed after/alongside late US1 tasks if no file conflicts
- **Phase 5 (US3)**: Depends on Phase 2 and requires migrated surfaces from US1/US2
- **Phase 6 (Polish)**: Depends on all selected user stories

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories after foundation
- **US2 (P2)**: No strict dependency on US1, but shared files may require merge coordination
- **US3 (P3)**: Depends on migrated query/store surfaces from US1 and US2 to enforce ownership/conflict rules consistently

### Within Each User Story

- Hooks/utilities before page/component integration
- Shared primitives before screen adoption
- Migration matrix update after story-specific implementation tasks

### Parallel Opportunities

- Setup: T003 parallel with T001/T002
- Foundation: T005, T006, T009 parallel once T004 starts
- US1: T012 and T013 parallel; T014/T015 can split by file owner
- US2: T022 and T023 parallel, then integrate
- US3: T030 parallel with preparatory review; T037 and T038 parallel in polish

---

## Parallel Example: User Story 1

```bash
# Parallel query hook creation
Task: "T012 [US1] Add query hooks for web trading data in apps/web/src/lib/query/use-webtrading-queries.ts"
Task: "T013 [US1] Add query hooks for auth/session profile data in apps/web/src/lib/query/use-auth-queries.ts"

# Parallel screen migration after hooks are ready
Task: "T014 [US1] Migrate web trading page data loading in apps/web/src/app/webtrading/page.tsx"
Task: "T018 [US1] Migrate auth callback interactions in apps/web/src/app/auth/callback/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2 foundations.
2. Complete all US1 tasks (Phase 3).
3. Validate US1 independently using its test criteria.
4. Demo reliable server-data lifecycle improvements.

### Incremental Delivery

1. Deliver US1 (server-state reliability) first.
2. Add US2 for predictable shared local state.
3. Add US3 for ownership enforcement and conflict policy.
4. Finish with cross-cutting lint/type-check/manual validation.

### Parallel Team Strategy

1. One developer handles foundation query provider + client defaults.
2. One developer migrates trading screens while another migrates auth/login paths.
3. Ownership/conflict tasks are integrated after both query/store migrations stabilize.

---

## Notes

- [P] tasks indicate independent files and no incomplete-task dependency.
- Story labels ensure traceability from tasks to spec user stories.
- All tasks are scoped to `apps/web` plus feature docs under `specs/001-react-query-zustand`.
- Avoid bundling many screen migrations in a single commit to keep rollback safe.
