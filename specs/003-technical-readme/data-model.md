# Data Model: Technical Project README (conceptual)

**Date**: 2026-05-07  
**Feature**: `specs/003-technical-readme/spec.md`

This feature is documentation-first, but the README must describe the project’s core entities in a way that is consistent and easy to reason about during interviews.

## System Components (high level)

### Apps (`apps/*`)

- **web**: User-facing trading UI (browser client)
- **api**: HTTP API for auth and trade requests; publishes/consumes stream events
- **trade-engine**: Worker that processes jobs and maintains in-memory trading state
- **price-poller**: Worker that ingests market data and publishes ticks
- **timescale-db**: Consumer that persists ticks/aggregates to a Timescale-enabled database
- **quotes-engine**: Present in repo; README should briefly state its current role/status

### Packages (`packages/*`)

- **@repo/types**: Shared enums, queue/stream names, schemas (validation), and cross-app contracts
- **@repo/redis**: Shared Redis client instances (publisher/subscriber)
- **@repo/ui**: Shared UI scaffold (optional / currently not required by `apps/web`)
- **@repo/eslint-config**, **@repo/typescript-config**: Tooling packages

## Event Bus Model (conceptual)

- **Redis Streams** act as the communication backbone for workers and the API.
- **Streams** (names come from shared types):
  - `send_stream`: price ticks and trade jobs
  - `response_stream`: order responses back to the API

## Common Runtime Configuration (conceptual)

- **API database connection**: configured via `DATABASE_URL`
- **Session/auth**: configured via `JWT_SECRET`
- **Email/magic link**: configured via `RESEND_API_KEY` and `EMAIL_FROM` (for sending), while the README should describe safe local alternatives (e.g., using returned magic-link URL output)
- **Web API base URL**: `NEXT_PUBLIC_API_BASE_URL` for browser → API calls

