# Quickstart: End-to-end demo (local)

**Date**: 2026-05-07  
**Feature**: `specs/003-technical-readme/spec.md`

This quickstart is the reference for what the root `README.md` must describe: a **full end-to-end** local demo (web + api + redis + workers + db).

## Prerequisites

- **Bun** (repo is pinned to `bun@1.3.5` in root `package.json`)
- **Node** `>= 18` (tooling requirement)
- **Redis** (default localhost:6379 works with the current `@repo/redis` client)
- **Postgres** (for the API via Prisma; set via `DATABASE_URL`)
- **TimescaleDB** (optional-but-recommended if running `apps/timescale-db`; currently uses a hardcoded local connection string)

## 1) Install dependencies (repo root)

```bash
bun install
```

## 2) Start infrastructure

In separate terminals (or using your preferred service manager):

- **Redis**: must be reachable on `localhost:6379`
- **Postgres**: create a database for the API, then set `DATABASE_URL`
- **TimescaleDB**: ensure a Timescale-enabled DB exists if running `apps/timescale-db`

## 3) Configure environment variables

Minimal required for a functional local run:

- `DATABASE_URL` — API database connection string
- `JWT_SECRET` — secret used to sign/verify session cookies

Recommended for the magic-link email workflow:

- `RESEND_API_KEY` — API key to send emails (optional for local; the API also returns a `link` in the response)
- `EMAIL_FROM` — “from” email address for Resend

For the frontend:

- `NEXT_PUBLIC_API_BASE_URL` — defaults to `http://localhost:3000`

## 4) Run the services (end-to-end)

Run each app in its own terminal from the repo root.

### API (port 3000)

```bash
cd apps/api
bun run dev
```

### Web (port 3001)

```bash
cd apps/web
bun run dev
```

### Trade engine (worker)

```bash
cd apps/trade-engine
bun run dev
```

### Price poller (worker)

```bash
cd apps/price-poller
bun run dev
```

### Timescale consumer (optional worker)

```bash
cd apps/timescale-db
bun run dev
```

## 5) Verify the demo

- Open the UI at `http://localhost:3001`
- Use the login flow (the API returns a magic link; if email is not configured, copy the returned link)
- After login, you should be redirected into `/webtrading`

## Troubleshooting notes (to carry into README)

- **Login doesn’t “stick”**: API sets `secure: true` cookies; local HTTP may not persist cookies depending on browser/CORS. The README should call this out explicitly as a common local dev gotcha.
- **Workers idle / nothing happens**: ensure Redis is running and all workers are started; order flow relies on Redis Streams.
- **Timescale consumer fails**: the Timescale DB connection string is currently hardcoded; adjust the DB locally or refactor to env in a future step.

