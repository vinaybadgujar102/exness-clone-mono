# State Ownership Guidelines

## Ownership Rules

- `server-query`: Any API-backed data, cache, loading/error/retry state.
- `shared-client-store`: Cross-component UI/session state only.
- `local-component`: Ephemeral single-component interaction state.

## Hard Exclusions

- Never store server-authoritative balances, open positions, or chart candles in Zustand.
- Never duplicate React Query response payloads in local stores.

## Conflict Policy

- If server-confirmed data conflicts with a local draft, server data wins.
- Drop conflicting local draft state and show a user-facing conflict notice.
