# Implementation Plan: Technical Project README

**Branch**: `003-technical-readme` | **Date**: 2026-05-07 | **Spec**: [`specs/003-technical-readme/spec.md`](./spec.md)  
**Input**: Feature specification from `specs/003-technical-readme/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Replace the repository root `README.md` with a clean, interviewer-friendly technical overview of the monorepo: what it is, how to run a full end-to-end demo, how the system is designed (with Mermaid diagrams), and what trade-offs/limitations exist—while keeping the document skimmable (~2–3 pages) with 1–2 screenshots.

## Technical Context

**Language/Version**: TypeScript (repo uses TypeScript `5.9.2`; apps use TypeScript `^5`)  
**Primary Dependencies**: Bun workspaces + Turborepo; Next.js (web UI); Express (API); Redis Streams; Postgres/Prisma; TimescaleDB  
**Storage**: Postgres (API via Prisma), TimescaleDB (ticks/candles), Redis Streams (event bus)  
**Testing**: Not required for this documentation feature (manual validation only)  
**Target Platform**: Local development on macOS/Linux/Windows (Bun + local services)  
**Project Type**: Monorepo with multiple apps/workers + shared packages  
**Performance Goals**: N/A for documentation deliverable (README should be skimmable and runnable)  
**Constraints**: README must stay “first look” sized (~2–3 pages), include Mermaid diagrams, include 1–2 screenshots  
**Scale/Scope**: Explain end-to-end system (web + api + redis + workers + db) without deep internal implementation detail

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Scope is documentation only (root `README.md` + any lightweight supporting docs/assets). This is explicitly requested and does not modify `apps/*` business logic.
- Architecture uses clean typed React/TypeScript patterns and simple abstractions.
- UX approach follows Exness-style clarity and reduced cognitive load.
- Dependencies audited from current `apps/web/package.json` before adding new packages.
- If server state is needed, prefer `@tanstack/react-query`; if shared client state is
  needed, prefer `zustand`; justify alternatives.
- Testing is optional unless explicitly requested by the user.

## Project Structure

### Documentation (this feature)

```text
specs/003-technical-readme/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
exness-clone-mono/
├── README.md                 # Public-facing doc to replace (this feature deliverable)
├── PROJECT_INFO.md           # Internal repo reference (source material)
├── apps/
│   ├── web/                  # Next.js trading UI (port 3001)
│   ├── api/                  # HTTP API (port 3000) + DB access + Redis streams
│   ├── trade-engine/         # Redis consumer/worker (in-memory trading)
│   ├── price-poller/         # WebSocket → Redis price ticks
│   ├── timescale-db/         # Redis consumer → Timescale inserts / aggregates
│   └── quotes-engine/        # Present (details TBD in README)
└── packages/
    ├── types/                # Shared types, Zod schemas, queue names
    ├── redis/                # Shared Redis clients (publisher/subscriber)
    ├── ui/                   # Shared UI package scaffold (not required by web yet)
    ├── eslint-config/        # Shared ESLint config
    └── typescript-config/    # Shared tsconfig fragments
```

**Structure Decision**: Monorepo (`apps/*` + `packages/*`) with a broker-style event-driven backend (Redis Streams), a web UI, and supporting workers/consumers. The README will mirror this structure and explain each app/package’s responsibility at a high level.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Constitution scope boundary (`apps/web` only) | This feature is documentation-only, requested explicitly, and needs to edit root `README.md` at repo root. | Keeping the generic Turborepo README would fail the portfolio goal and the spec requirements. |
