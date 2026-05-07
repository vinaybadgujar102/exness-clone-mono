# Research: Technical Project README

**Date**: 2026-05-07  
**Feature**: `specs/003-technical-readme/spec.md`

## Decisions

### D1: README “basic demo” scope

- **Decision**: The README “basic demo” path starts the **full end-to-end system** (all required services).
- **Rationale**: Aligns with portfolio expectations and reduces ambiguity about what “running the project” means.
- **Alternatives considered**:
  - Backend-only demo: easier setup but does not validate the full system story.
  - Frontend-only demo: fastest but risks being mostly static/mocked.

### D2: Diagram format

- **Decision**: Use **Mermaid diagrams embedded directly in `README.md`**.
- **Rationale**: Skimmable on GitHub, easy to keep in sync with code changes, no extra tooling required.
- **Alternatives considered**:
  - Image-only diagrams: better visuals, but higher maintenance overhead.
  - Mixed (Mermaid + images): can bloat the “first look” target.

### D3: “First look” size constraint

- **Decision**: Keep the README **short (~2–3 pages)** and skimmable; defer deeper detail to linked docs only when needed.
- **Rationale**: Interviewers optimize for quick comprehension; too much text reduces conversion.
- **Alternatives considered**:
  - 1-page ultra-short: risks missing critical architecture/quickstart info.
  - 4–6 pages: increases cognitive load and makes navigation harder.

### D4: Screenshots

- **Decision**: Include **1–2 key screenshots** in the README.
- **Rationale**: Improves immediate comprehension of “what I’m looking at” without bloating the doc.
- **Alternatives considered**:
  - No screenshots: lower impact for first-glance understanding.
  - Many screenshots/GIFs: quickly exceeds the size target.

## Source Material (repo-specific)

- `PROJECT_INFO.md` already contains:
  - A correct high-level system description (apps/packages)
  - A Mermaid architecture diagram and notes on queue/stream names
  - A list of local setup requirements and known footguns

## Implementation Notes (documentation-only)

- Root `README.md` currently contains generic Turborepo template content; it should become the public-facing entry point.
- App-level `README.md` files are mostly Bun boilerplate and should be referenced sparingly (or ignored) in favor of a single coherent root README.

