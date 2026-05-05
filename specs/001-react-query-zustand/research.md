# Research: React Query + Zustand Migration

## Decision 1: Server-state library

- **Decision**: Use `@tanstack/react-query` for all server-state data flows.
- **Rationale**: It provides stable caching, invalidation, retries, and background refresh behavior that match the feature requirements and reduces custom fetch lifecycle code.
- **Alternatives considered**:
  - Custom `fetch` + hooks: rejected due to duplicated cache/retry/invalidation logic.
  - SWR: rejected to avoid diverging from constitution-preferred stack.

## Decision 2: Shared client-state library

- **Decision**: Use `zustand` for shared UI/session state only.
- **Rationale**: Lightweight stores with clear slice boundaries are well-suited for cross-component state without introducing heavy ceremony.
- **Alternatives considered**:
  - React Context + reducers everywhere: rejected due to larger rerender surface and verbose boilerplate for multi-slice shared state.
  - Redux Toolkit: rejected as unnecessary complexity for current app size and scope.

## Decision 3: Retry and resilience policy

- **Decision**: Default retry for recoverable errors is up to 3 attempts with exponential backoff.
- **Rationale**: Balances resilience against transient failures with backend safety and predictable UX.
- **Alternatives considered**:
  - One retry only: rejected as too weak for short network blips.
  - No auto retry: rejected due to avoidable user-facing failures.

## Decision 4: Stale data UX

- **Decision**: Show last cached data when offline/failed, display stale indicator, and provide manual refresh action.
- **Rationale**: Preserves continuity for trading users while transparently signaling freshness risk.
- **Alternatives considered**:
  - Block UI until fresh data: rejected due to poor continuity.
  - Error-only with hidden cached data: rejected because it removes useful context.

## Decision 5: Conflict resolution

- **Decision**: Server-confirmed data wins; conflicting local draft is discarded with explicit user notice.
- **Rationale**: Trading workflows prioritize authoritative data correctness over local temporary edits.
- **Alternatives considered**:
  - Local wins: rejected due to stale-risk and data trust concerns.
  - Manual conflict merge UX: rejected for v1 complexity and error risk.

## Decision 6: Migration rollout strategy

- **Decision**: Complete rollout in a single feature cycle covering all active frontend screens, executed in careful screen-by-screen sequence.
- **Rationale**: Meets clarified scope while still minimizing risk through incremental implementation steps and verification checkpoints.
- **Alternatives considered**:
  - Multi-release rollout: rejected due to explicit clarification selecting all screens in this pass.
  - Big-bang single commit migration: rejected due to rollback and debugging risk.

## Decision 7: State ownership boundary

- **Decision**: Server-originated data must live in query state; cross-component UI/session state must live in stores; component-local view state stays local component state.
- **Rationale**: Prevents overlap, reduces bugs, and keeps ownership obvious for future feature work.
- **Alternatives considered**:
  - Allow mixed ownership ad hoc: rejected due to maintenance ambiguity.
