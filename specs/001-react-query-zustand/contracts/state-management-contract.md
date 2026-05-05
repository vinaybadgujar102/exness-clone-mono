# Contract: Frontend State Management Standards

## Purpose

Define enforceable contracts for migrating frontend state in `apps/web` to a unified server/local ownership model.

## Contract 1: Ownership Classification

- Every migrated screen MUST classify each state concern as one of:
  - `server-query`
  - `shared-client-store`
  - `local-component`
- A state concern MUST belong to exactly one category.

## Contract 2: Server-state Handling

- Server-originated data MUST use query-managed lifecycle.
- Query behavior MUST include:
  - Loading/empty/success/error states.
  - Up to 3 retries for recoverable failures with exponential backoff.
  - Invalidation on successful mutations affecting related data.
- If fresh data is unavailable, app MUST show cached data with stale indicator and manual refresh action.

## Contract 3: Client-state Handling

- Shared UI/session state MUST use store slices.
- Store state MUST be session-scoped by default and reset on browser restart.
- Store slices MUST NOT duplicate server-authoritative resource data.

## Contract 4: Conflict Resolution

- If local draft state conflicts with newer server-confirmed data:
  - Server data MUST take precedence.
  - Conflicting local draft MUST be discarded.
  - User MUST receive a clear notice that data was refreshed and local draft was dropped.

## Contract 5: Rollout Scope

- Migration MUST cover all currently active frontend screens in the current rollout.
- Migration execution may be staged screen-by-screen, but completion criteria requires full active-screen coverage before closeout.

## Contract 6: Verification Requirements

- For each migrated screen, manual verification MUST confirm:
  - Successful data load behavior.
  - Recoverable failure retry behavior.
  - Stale indicator and manual refresh behavior.
  - Conflict handling and user notice behavior.
  - Preservation of session-scoped shared local state during in-session navigation.
