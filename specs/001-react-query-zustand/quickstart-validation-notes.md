# Quickstart Validation Notes

## Automated Checks

- `bun run lint` in `apps/web`
- `bun run check-types` in `apps/web`

## Manual Verification Matrix

- Trading screens load open positions through React Query.
- Recoverable failures surface actionable error state and allow refresh.
- Cached/stale state shows a visible stale indicator and manual refresh.
- Login + callback flows use mutation-backed requests.
- Shared UI controls persist across route changes within active session.
- Conflict notice displays when server state supersedes a local draft.
