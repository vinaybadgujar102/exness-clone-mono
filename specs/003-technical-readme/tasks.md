# Tasks: Technical Project README

**Input**: Design documents from `specs/003-technical-readme/`  
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/readme-contract.md`, `quickstart.md`  
**Tests**: Not requested (omit test tasks)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the documentation work area and source-of-truth inputs

- [x] T001 Confirm feature artifacts exist in `specs/003-technical-readme/` (spec/plan/research/contracts/quickstart)
- [x] T002 [P] Review `PROJECT_INFO.md` for canonical architecture + quickstart notes to reuse in root README
- [x] T003 [P] Review root `README.md` (currently generic template) to plan replacement content

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the README “contract” and structure before writing content

- [x] T004 Draft the final section outline in `README.md` per `specs/003-technical-readme/contracts/readme-contract.md`
- [x] T005 Decide which 1–2 screenshots to include and add placeholder image refs in `README.md` (store assets under `docs/images/` if needed)
- [x] T006 Ensure the README stays “first-look” sized (target ~2–3 pages) by enforcing bullet-first writing and strict section sizing in `README.md`

**Checkpoint**: Outline is locked; content can be filled in reliably.

---

## Phase 3: User Story 1 - First-look understanding (Priority: P1) 🎯 MVP

**Goal**: A reviewer can understand purpose + components + flows within minutes.

**Independent Test**: A reviewer can explain the system after reading only `README.md` for ~5 minutes (no code execution).

- [x] T007 [US1] Replace root `README.md` title + one-liner + TL;DR (≤ 60s) in `README.md`
- [x] T008 [US1] Add “What’s inside” repo map for `apps/*` and `packages/*` in `README.md`
- [x] T009 [US1] Add an architecture overview with at least one Mermaid diagram in `README.md` (use `PROJECT_INFO.md` as source)
- [x] T010 [US1] Add “Key flows” section (login flow + trade flow) in `README.md`
- [x] T011 [US1] Add “Design decisions & trade-offs” (4–8 bullets) in `README.md`
- [x] T012 [US1] Add “Limitations / project status” section in `README.md` (what’s simplified / presentational / WIP)
- [x] T013 [US1] Add “Next steps” section (≤ 5 items) in `README.md`

**Checkpoint**: US1 is complete when `README.md` is understandable without running anything.

---

## Phase 4: User Story 2 - Local run and verification (Priority: P2)

**Goal**: A developer can run the full end-to-end demo quickly.

**Independent Test**: A developer can start the full system by following the README without guessing prerequisites.

- [x] T014 [US2] Add end-to-end “Quickstart” steps to `README.md` (based on `specs/003-technical-readme/quickstart.md`)
- [x] T015 [US2] Add “Configuration” section listing required environment variables (no secrets) in `README.md`
- [x] T016 [US2] Add “Troubleshooting” section in `README.md` including cookie `secure: true` gotcha and worker/Redis/Timescale notes

**Checkpoint**: US2 is complete when the README has a single coherent end-to-end run path (not partial/mocked).

---

## Phase 5: User Story 3 - System design discussion (Priority: P3)

**Goal**: An interviewer can quickly find trade-offs and discussion hooks.

**Independent Test**: A reviewer can point to explicit trade-offs and a bounded roadmap in the README.

- [x] T017 [US3] Add “Security & safety notes” in `README.md` (cookie auth, env secrets, local-dev safe defaults, no credential leakage)
- [x] T018 [US3] Tighten “Design decisions & trade-offs” to include rationale + alternatives (use `specs/003-technical-readme/research.md` decisions)

**Checkpoint**: US3 is complete when the README supports a 15-minute architecture interview discussion.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Ensure clarity, correctness, and maintainability.

- [x] T019 [P] Run a “first-look” scan: ensure TL;DR + screenshots + headings appear above the fold in `README.md`
- [x] T020 [P] Validate Mermaid diagrams render correctly in GitHub markdown (`README.md`)
- [x] T021 Ensure README stays within the size target (~2–3 pages) by trimming or moving deep detail to `PROJECT_INFO.md` (or a new `docs/` page if needed)
- [x] T022 Ensure all commands/ports referenced match the repo (`apps/web` 3001, `apps/api` 3000) in `README.md`
- [x] T023 Ensure no secrets or real credentials are present in `README.md` (only placeholders)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Phase 1; blocks content writing quality
- **US1/US2/US3 (Phase 3–5)**: Depend on Phase 2
- **Polish (Phase 6)**: Depends on completing the desired user stories (at minimum US1)

### User Story Dependencies

- **US1 (P1)**: Must be done first (README becomes understandable)
- **US2 (P2)**: Builds on US1 (adds runnable quickstart/config/troubleshooting)
- **US3 (P3)**: Builds on US1 (adds interview-ready design/security discussion)

### Parallel Opportunities

- Phase 1 tasks marked **[P]** can run in parallel
- In Phase 6, rendering/size/secret checks can run in parallel

---

## Parallel Example: User Story 1

```bash
Task: "Add repo map (apps/* + packages/*) section in README.md"
Task: "Draft Mermaid architecture diagram section in README.md"
Task: "Draft Key flows section in README.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 + Phase 2
2. Implement US1 tasks (T007–T013)
3. Stop and validate SC-001/SC-005 using only the README

### Incremental Delivery

1. US1 → readability and architecture comprehension
2. US2 → runnable end-to-end demo
3. US3 → interview discussion hooks + security notes

