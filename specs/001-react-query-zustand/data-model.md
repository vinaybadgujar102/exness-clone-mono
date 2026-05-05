# Data Model: React Query + Zustand Migration

## Entity: ServerQueryState

Represents remote resource lifecycle for each queryable data domain.

### Fields

- `queryKey`: Canonical identifier for remote data resource.
- `status`: `idle | loading | success | error`.
- `isFetching`: Boolean flag for background refresh activity.
- `isStale`: Boolean freshness indicator.
- `lastUpdatedAt`: Timestamp of latest successful data.
- `errorKind`: Recoverable/non-recoverable classification for user messaging.
- `retryCount`: Current retry attempt count (max 3 by default).

### Validation Rules

- `queryKey` must follow shared key factory conventions.
- `retryCount` must never exceed configured max retries.
- `isStale` must be true when data is displayed without fresh confirmation.

### Lifecycle

`idle -> loading -> success|error`  
`success -> stale -> fetching -> success|error`  
`error -> retrying -> success|error`

## Entity: LocalUIStateSlice

Represents shared non-server client state for cross-component interactions.

### Fields

- `sliceName`: Domain-aligned state slice identifier.
- `stateValue`: Slice payload.
- `updatedAt`: Last local mutation timestamp.
- `scope`: `session` (default).

### Validation Rules

- Slice must exclude server-authoritative resource data.
- Scope defaults to session and resets on browser restart.
- Shared slice must be used only when state crosses component boundaries.

### Lifecycle

`initialized -> active -> updated -> reset (session end/browser restart)`

## Entity: StateOwnershipRule

Defines where each state concern must live.

### Fields

- `stateConcern`: Business/UI concern label.
- `ownerType`: `server-query | shared-client-store | local-component`.
- `conflictPolicy`: `server-wins` for server/local conflicts.
- `userNoticeRequired`: Boolean.

### Validation Rules

- Every migrated state concern must have exactly one ownerType.
- Conflict policy for server/local overlap must be `server-wins`.

## Entity: DataRefreshEvent

Triggers revalidation/invalidation behavior after user actions or system events.

### Fields

- `eventType`: `mutation-success | manual-refresh | window-focus | reconnect`.
- `targetQueryKeys`: List of affected query keys.
- `priority`: `high | normal`.

### Validation Rules

- Mutation success events must invalidate all affected query keys.
- Manual refresh must trigger immediate re-fetch for targeted queries.
