# Quickstart: Careful Migration Plan

## 1) Prepare dependencies (apps/web only)

1. From repo root, add dependencies to `apps/web`:
   - `@tanstack/react-query`
   - `zustand`
2. Confirm no non-frontend package changes are required.

## 2) Establish shared foundations

1. Add top-level query provider in app bootstrap.
2. Configure default query behavior:
   - Retry recoverable failures up to 3 times.
   - Exponential backoff between retries.
3. Define shared query key conventions.
4. Create store folder and initial typed store-slice conventions.

## 3) Migrate screens safely (all active frontend screens)

1. Inventory active screens and assign migration order:
   - High-risk trading flows first (with immediate manual checks).
   - Medium/low-risk informational screens next.
2. For each screen:
   - Replace ad hoc server fetch/state logic with query lifecycle.
   - Move cross-component shared local state to store slices.
   - Keep component-local ephemeral state local.
   - Implement stale indicator + manual refresh for stale data cases.
   - Implement conflict notice behavior where applicable.

## 4) Verification per migrated screen

1. Success path data load.
2. Recoverable failure auto-retry (max 3 with backoff).
3. Manual retry from error state.
4. Stale cached data UI (indicator + manual refresh).
5. Conflict case: server wins and user notice shown.
6. Session-state behavior across route transitions.

## 5) Repo-level checks

From `apps/web`:

1. Run `npm run lint` (or workspace equivalent).
2. Run `npm run check-types`.
3. Fix issues before moving to next screen batch.

## 6) Rollback safety

1. Keep migration changes grouped by screen/module for reversible commits.
2. If a regression appears in one screen, revert only that screen migration while retaining shared foundational setup.

## 7) Done criteria

- All active frontend screens use the new ownership model.
- No screen retains conflicting duplicated server/local ownership.
- Manual verification matrix passes for all migrated screen groups.

## 8) Rollout notes

- Query defaults now provide bounded retries and shared stale handling.
- Trading data now invalidates/refetches through mutation-driven query rules.
- Shared UI state now lives in Zustand slices with session-scope reset support.
- Server-wins conflict handling now surfaces an explicit user notice.
