# Contract: Root README (portfolio-friendly)

**Date**: 2026-05-07  
**Feature**: `specs/003-technical-readme/spec.md`

## Purpose

Define the minimum structure and content guarantees for the repository root `README.md` so an interviewer can understand and run the project quickly.

## Required Sections (order matters)

1. **Title + one-liner**
   - Repo name and a one-sentence description of the system.

2. **TL;DR (≤ 60 seconds)**
   - 3–6 bullets describing: what it is, key components, what you can demo.

3. **Screenshots (1–2)**
   - Show the primary user-facing surface (e.g., landing, webtrading screen).

4. **What’s inside (repo map)**
   - Short explanation of each `apps/*` and `packages/*` entry.

5. **Architecture (Mermaid)**
   - At least one Mermaid diagram showing the main components and data flow.
   - Must mention Redis Streams and the key stream names at a high level.

6. **Key flows**
   - At least two short end-to-end flows (conceptual):
     - Login/auth flow (magic link → session cookie)
     - Trade flow (web → api → stream → trade-engine → response → api/web)

7. **Quickstart (end-to-end)**
   - Minimal steps to run the full system locally.
   - Must clearly list required external services and configuration.

8. **Configuration**
   - List required env vars with purpose (no secrets, no real credentials).

9. **Troubleshooting**
   - Include at least: cookie auth gotcha (secure cookies), missing services, common startup order problems.

10. **Design decisions & trade-offs**
   - 4–8 bullets that can drive an interview discussion.

11. **Limitations / project status**
   - What is presentational, what is WIP, what is intentionally simplified.

12. **Next steps (≤ 5)**
   - Realistic improvements for a future iteration.

## Content Constraints

- README stays skimmable: roughly **2–3 pages** of scrolling.
- Diagrams are **Mermaid** in README (not image-only).
- Quickstart is **end-to-end**, not partial or mocked.

## Acceptance Checklist

- A reviewer can understand the system in 5 minutes (per spec success criteria).
- A developer can reach a basic demo in ≤ 15 minutes (excluding downloads).
- No secrets are committed or shown.
- Sections are easy to find (headings + table of contents).

