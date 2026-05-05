<!--
Sync Impact Report
- Version change: N/A -> 1.0.0
- Modified principles:
  - N/A -> I. Frontend Scope Boundary (apps/web Only)
  - N/A -> II. Clean, Typed React Architecture
  - N/A -> III. Exness-Style Simple UX
  - N/A -> IV. Modern Frontend State and Data Stack
  - N/A -> V. Delivery Efficiency (No Mandatory Tests)
- Added sections:
  - Frontend Delivery Constraints
  - Workflow and Review Expectations
- Removed sections:
  - None
- Templates requiring updates:
  - ✅ updated: .specify/templates/plan-template.md
  - ✅ updated: .specify/templates/spec-template.md
  - ✅ updated: .specify/templates/tasks-template.md
  - ⚠ pending: .specify/templates/commands/*.md (directory not present)
- Follow-up TODOs:
  - None
-->
# Exness Clone Mono Constitution

## Core Principles

### I. Frontend Scope Boundary (apps/web Only)
All implementation work for product features MUST be limited to `apps/web` unless
explicitly authorized by the user. If a requirement depends on backend, trade engine,
shared package, or infrastructure changes, the agent MUST stop and provide a clear
handoff list of required non-frontend updates instead of editing those areas directly.
Rationale: strict scope control protects unrelated systems and keeps delivery focused.

### II. Clean, Typed React Architecture
Frontend code MUST prioritize readability, composability, and explicit typing using
current stable TypeScript and React patterns. Components MUST remain small and
purposeful, business logic MUST move to hooks/services when it grows, and naming MUST
be consistent and domain-oriented. Any added abstraction MUST solve a current
complexity, not speculative future needs. Rationale: clean structure reduces defects
and onboarding time while sustaining velocity.

### III. Exness-Style Simple UX
User experience decisions MUST favor clarity, speed, and trust, mirroring Exness-style
financial UI conventions: high information density with clear hierarchy, restrained
visual noise, predictable interactions, and legible typography/contrast. Every screen
change MUST reduce cognitive load and keep critical trading/account actions obvious.
Rationale: users in trading contexts need immediate comprehension and confidence.

### IV. Modern Frontend State and Data Stack
Feature plans for `apps/web` MUST analyze current dependencies first, then adopt modern
libraries when needed. Server-state flows SHOULD use `@tanstack/react-query`, and
client/shared UI state SHOULD use `zustand` when local component state is insufficient.
Library additions MUST include a direct usage rationale and avoid overlapping
alternatives in the same feature. Rationale: consistent state/data patterns improve
performance and maintainability.

### V. Delivery Efficiency (No Mandatory Tests)
Testing tasks are optional by default and MUST only be included when the user explicitly
requests them. In all cases, deliverables MUST still include lint/type-check readiness,
clear manual verification notes, and regressions-risk callouts. Rationale: this project
optimizes for fast frontend iteration while retaining explicit quality checks.

## Frontend Delivery Constraints

- Allowed implementation target: `apps/web` and its internal frontend files only.
- If `apps/api`, `apps/trade-engine`, `packages/*`, or infra changes are required,
  document exact required changes and wait for user direction.
- Dependency analysis is mandatory before introducing any package in `apps/web`.
- Prefer existing workspace conventions first; add dependencies only with concrete need.

## Workflow and Review Expectations

1. Start each frontend task by confirming scope and inspecting current `apps/web`
   dependencies.
2. Implement the smallest complete UX slice using typed React components and simple
   interaction patterns.
3. Record manual verification steps and run lint/type-check when possible.
4. If blocked by non-frontend requirements, stop code edits and provide a concise,
   actionable handoff list.

## Governance

This constitution is authoritative for Spec Kit planning and implementation in this
repository.

- Amendment Process: changes MUST be documented in this file, include a rationale, and
  update dependent templates in `.specify/templates`.
- Versioning Policy:
  - MAJOR for incompatible governance or principle removals/redefinitions.
  - MINOR for new principles/sections or materially expanded requirements.
  - PATCH for clarifications and editorial changes without semantic impact.
- Compliance Review: every plan, spec, and tasks artifact MUST pass a constitution
  check for frontend scope boundaries, UX simplicity, and dependency strategy.

**Version**: 1.0.0 | **Ratified**: 2026-05-05 | **Last Amended**: 2026-05-05
