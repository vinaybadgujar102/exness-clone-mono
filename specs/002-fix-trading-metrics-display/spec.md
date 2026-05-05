# Feature Specification: Fix Trading Metrics Display Consistency

**Feature Branch**: `002-currently-guess-vlaues`  
**Created**: 2026-05-05  
**Status**: Draft  
**Input**: User description: "currently i guess the vlaues in the frontend are not correctly shown. like while opening trades, the live pnl in every tick the balance, equity margin remaining. the values look broken to me. please double check if its correct or not"

## Clarifications

### Session 2026-05-05

- Q: How should the UI behave when not all live metric inputs are available in the same update cycle? -> A: Option B - Display metrics only from a single atomic snapshot; if any required value is missing, keep prior full snapshot and mark stale.
- Q: What stale-data threshold and user-facing behavior should be used? -> A: Mark data stale after 10 seconds with no toast/message; instead render live metrics in a greyed state.
- Q: What display precision policy should be used for trading metrics? -> A: Option B - Use metric-specific precision with consistent rounding mode (PnL, balance, equity, and margin values shown to 2 decimals).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Accurate live account values while trading (Priority: P1)

As an active trader, I need live PnL, balance, equity, used margin, and remaining margin to update correctly while prices tick so I can make risk decisions with confidence.

**Why this priority**: Incorrect live values can directly lead to wrong trading decisions, avoidable losses, and immediate trust issues.

**Independent Test**: Open one or more trades and observe successive price ticks; each displayed account metric updates in a mathematically consistent way that matches the expected formulas and account state.

**Acceptance Scenarios**:

1. **Given** a trader with at least one open position and active market ticks, **When** the market price changes, **Then** live PnL changes by the expected amount for the position size and direction.
2. **Given** the same account state, **When** live PnL changes, **Then** equity, used margin, and remaining margin reflect the same new state without contradictory values.
3. **Given** multiple open positions across symbols, **When** each position receives tick updates, **Then** aggregated account values remain internally consistent and do not drift between widgets.

---

### User Story 2 - Stable values during fast tick bursts (Priority: P2)

As a trader during volatile periods, I need the dashboard to remain stable and coherent under rapid updates so I can still read and trust what is shown.

**Why this priority**: Volatile sessions are when traders rely most on live risk values; visual instability or stale components creates high operational risk.

**Independent Test**: Simulate or replay high-frequency ticks and verify displayed values remain synchronized across all relevant UI surfaces without obvious flicker, lagged stale numbers, or temporary impossible states.

**Acceptance Scenarios**:

1. **Given** rapid incoming tick updates, **When** values refresh repeatedly, **Then** all account metrics stay synchronized within the same refresh cycle.
2. **Given** a short burst of updates, **When** rendering catches up, **Then** the final displayed values match the latest account computation state.

---

### User Story 3 - Clear behavior when live data is delayed (Priority: P3)

As a trader, I need a non-intrusive visual indication when live values are temporarily delayed so I can distinguish stale data from actual account changes.

**Why this priority**: Explicit stale-state feedback prevents false interpretation of paused values as market/account stability.

**Independent Test**: Introduce a temporary interruption in live updates and confirm UI clearly shows stale status while preserving last known good values until fresh updates resume.

**Acceptance Scenarios**:

1. **Given** live tick updates pause briefly, **When** no complete snapshot arrives for 10 seconds, **Then** the UI indicates stale data by greying the live metrics without showing toast notifications or intrusive alerts.
2. **Given** updates resume after a delay, **When** fresh values arrive, **Then** stale indication clears and all metrics reconcile to the current state.

---

### Edge Cases

- What happens when there are zero open trades and ticks continue for watched instruments?
- How does the system handle a position transitioning from profit to loss (and vice versa) across the same display cycle?
- What happens when a user opens or closes a trade during a rapid sequence of incoming ticks?
- How are values shown when computed remaining margin is near zero or exactly zero?
- How does the UI behave if one metric update is delayed while others arrive on time?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST compute and display live PnL for each open trade using the current market tick and trade direction/size rules.
- **FR-002**: System MUST compute and display account-level balance, equity, used margin, and remaining margin from a single consistent account state snapshot per refresh.
- **FR-003**: System MUST publish and render all related account metrics from a single atomic snapshot per refresh cycle so users never see mixed states from different calculation moments.
- **FR-004**: System MUST ensure all UI surfaces that show these trading metrics present the same values for the same account state.
- **FR-005**: System MUST preserve and display the last known complete metric snapshot when live updates are temporarily unavailable or incomplete for the current cycle.
- **FR-006**: System MUST indicate when displayed values are stale beyond the expected live-update interval.
- **FR-011**: System MUST mark live metrics as stale only when no complete snapshot arrives for 10 seconds.
- **FR-012**: System MUST represent stale state using greyed metric visuals and MUST NOT show toast notifications or pop-up messages for stale transitions.
- **FR-007**: System MUST recalculate and reflect account metrics immediately after trade lifecycle changes (open, close, partial close, stop-loss/take-profit execution).
- **FR-008**: System MUST avoid rendering impossible account states (for example, remaining margin greater than equity when used margin is positive).
- **FR-009**: System MUST provide deterministic rounding/display precision rules so the same numeric value is shown consistently across components.
- **FR-010**: System MUST keep metric updates correct for single-position and multi-position portfolios.
- **FR-013**: System MUST display PnL, balance, equity, used margin, and remaining margin with two decimal places using one consistent rounding mode across all components.

### Key Entities *(include if feature involves data)*

- **Trade Position**: An active or recently closed trade with symbol, side, size, entry price, and current market price used for live PnL.
- **Account Snapshot**: A coherent state containing balance, equity, used margin, remaining margin, and timestamp representing one calculation moment.
- **Market Tick**: A real-time price update event that triggers recalculation of affected position and account metrics.
- **Display Metric Set**: The exact formatted values rendered to the user for PnL and account risk fields at a point in time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In validation runs covering common trade scenarios, 100% of displayed PnL, equity, used margin, and remaining margin values match expected calculations.
- **SC-002**: During high-frequency update simulations, at least 99% of refresh cycles show synchronized account metrics with no contradictory values across UI sections.
- **SC-003**: Traders can complete a manual verification checklist for core trading screens with zero critical discrepancies in live account values.
- **SC-004**: Reported user complaints about "broken" live account value displays decrease by at least 80% in the first release cycle after rollout.

## Assumptions

- The backend and trade engine provide the required raw pricing and position/account inputs; this feature focuses on value correctness and display consistency.
- Scope is limited to frontend trading surfaces where live PnL and account risk values are shown.
- Existing account formula definitions are the source of truth and are not being redefined in this feature.
- Temporary network/data interruptions are expected and should be represented as stale data rather than fabricated fresh values.

## Constitution Alignment *(mandatory)*

- **Scope Boundary**: Implementation is limited to `apps/web`. Any backend or engine discrepancies discovered during validation are documented as handoffs.
- **UX Direction**: The experience prioritizes clear, trustworthy, and minimally noisy live-value presentation aligned with Exness-style visual clarity.
- **Dependency Strategy**: Use existing `apps/web` dependencies and current state stack; if `@tanstack/react-query`/`zustand` are involved in the value flow, maintain their intended ownership boundaries.
- **Testing Policy**: Automated tests remain optional unless explicitly requested; manual and deterministic verification flows are defined in this spec.
