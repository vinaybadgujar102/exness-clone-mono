# Shared Store Layer

Zustand stores are only for shared UI/session state.

## Allowed

- Selected asset, chart interval, search/filter text.
- Login form tab selection.
- Other cross-component UI state that is not API-authoritative.

## Not Allowed

- Open trades, balances, chart candles, session profile payloads.
- Any API response data that belongs to React Query.
