# Implementation Plan: React Query + Zustand Migration

**Branch**: `001-react-query-zustand` | **Date**: 2026-05-05 | **Spec**: `specs/001-react-query-zustand/spec.md`  
**Input**: Feature specification from `specs/001-react-query-zustand/spec.md`

## Summary

Migrate all current `apps/web` frontend screens to a consistent state strategy where server state uses `@tanstack/react-query` and shared client state uses `zustand`, with careful staged adoption, bounded defaults (3 retries with exponential backoff), stale-data UX behavior, and explicit server-wins conflict handling.

## Technical Context

**Language/Version**: TypeScript 5.9, React 19.2, Next.js 15.5  
**Primary Dependencies**: Existing: `next`, `react`, `react-dom`; Add: `@tanstack/react-query`, `zustand`  
**Storage**: Browser memory (session-scoped client state by default)  
**Testing**: Optional (not requested); rely on lint + type-check + manual flow verification  
**Target Platform**: Next.js web app in `apps/web`  
**Project Type**: Frontend web application  
**Performance Goals**: 95% of server-backed views render usable state within 2 seconds; non-blocking refresh interactions  
**Constraints**: Scope strictly limited to `apps/web`; no backend contract changes; keep UI clarity for trading workflows  
**Scale/Scope**: All currently active frontend screens in one rollout pass

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Scope (`apps/web` only)**: PASS. Changes confined to frontend app; no backend/trade-engine edits required.
- **Typed React architecture**: PASS. Plan uses explicit typed query keys, typed API service boundaries, and small focused stores.
- **Exness-style UX clarity**: PASS. Standard loading/empty/error/stale behaviors and clear notices included.
- **Dependency audit first**: PASS. `apps/web/package.json` currently lacks query/store libraries; additions are justified.
- **Preferred state stack**: PASS. Server state via `@tanstack/react-query`; shared client state via `zustand`.
- **Testing policy**: PASS. No mandatory automated tests introduced; manual verification steps included.

No gate violations.

## Phase 0: Research Outcomes

Research documented in `specs/001-react-query-zustand/research.md` with final decisions on:
- Query client defaults and retry/backoff policy.
- Local-state boundaries and persistence policy.
- Migration strategy for all screens with minimal regression risk.
- Conflict resolution and stale-data UX behavior.

## Phase 1: Design & Contracts

Design artifacts:
- `specs/001-react-query-zustand/data-model.md`
- `specs/001-react-query-zustand/contracts/state-management-contract.md`
- `specs/001-react-query-zustand/quickstart.md`

Design direction:
- Introduce a top-level query provider in `apps/web`.
- Define query-key conventions and invalidation triggers.
- Define store slice conventions and ownership rules.
- Standardize UI states: loading, empty, error, stale indicator, manual refresh.
- Enforce server-wins conflict policy with explicit user notice.

## Phase 2: Implementation Planning

1. Add dependencies in `apps/web` and set up app-level providers.
2. Introduce centralized query defaults and typed query key helpers.
3. Add shared Zustand stores for cross-component/session state only.
4. Migrate screens incrementally by risk tier (critical trading screens first within same rollout branch).
5. Replace ad hoc fetch/state patterns with query/store ownership rules.
6. Add conflict-notice UX and stale-indicator/manual-refresh UX consistently.
7. Run `lint` and `check-types` in `apps/web`, then execute manual verification matrix from `quickstart.md`.

Rollback strategy:
- Keep each screen migration in isolated commits during implementation phase.
- If regressions appear, revert only affected screen migration commit while keeping shared provider setup.

## Project Structure

### Documentation (this feature)

```text
specs/001-react-query-zustand/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── state-management-contract.md
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
└── trade-engine/

packages/
└── ...
```

**Structure Decision**: Use existing monorepo layout; implement only within `apps/web` and do not modify `apps/api`, `apps/trade-engine`, or shared packages in this feature.

## Post-Design Constitution Check

- Scope boundary remains `apps/web` only: PASS  
- Dependency strategy remains aligned (`@tanstack/react-query` + `zustand`): PASS  
- Simplicity and typed architecture maintained: PASS  
- UX clarity requirements included in contracts/quickstart: PASS  
- Testing policy respected (optional tests): PASS

## Complexity Tracking

No constitutional violations requiring justification.
