# Data Model: Trading Metrics Display Consistency

## Entity: AccountMetricSnapshot

Canonical, display-ready account metric state used by all frontend surfaces.

### Fields

- `snapshotVersion`: Monotonic identifier for ordering and atomic render gating.
- `capturedAt`: Snapshot timestamp used for stale detection.
- `balance`: Account balance value.
- `equity`: Account equity value.
- `usedMargin`: Margin currently consumed by open positions.
- `remainingMargin`: Available margin remaining.
- `aggregateLivePnl`: Sum of live PnL across open positions.
- `isComplete`: Indicates all required metric inputs for this snapshot are present.

### Validation Rules

- Snapshot is renderable only when `isComplete = true`.
- `remainingMargin` must match account formula expectations from the same snapshot inputs.
- All monetary fields must be displayable using shared 2-decimal formatting policy.

### Lifecycle

`constructed -> validated-complete -> published -> rendered -> superseded`

Incomplete snapshots remain non-renderable and must not replace the published snapshot.

## Entity: PositionLiveState

Per-position live state used during aggregate account metric computation.

### Fields

- `positionId`: Unique position identifier.
- `symbol`: Instrument symbol.
- `side`: Buy/sell direction.
- `size`: Position size.
- `entryPrice`: Position entry price.
- `markPrice`: Latest tick price.
- `livePnl`: Computed live PnL for this position.
- `status`: `open | closing | closed`.

### Validation Rules

- `livePnl` must be recalculated on each relevant tick.
- Closed positions cannot contribute to new aggregate live PnL snapshots.

## Entity: MetricFreshnessState

UI freshness metadata derived from complete snapshot arrival cadence.

### Fields

- `lastCompleteSnapshotAt`: Timestamp of most recent complete snapshot.
- `staleAfterMs`: Fixed threshold (`10000` milliseconds).
- `isStale`: Freshness flag shown in UI.
- `staleVisualMode`: `greyed`.
- `notificationsEnabled`: Must be `false` for stale transitions.

### Validation Rules

- `isStale` becomes true only when current time exceeds `lastCompleteSnapshotAt + staleAfterMs`.
- When `isStale = true`, stale visuals must be greyed and no toast/popup is emitted.
- `isStale` resets to false immediately after a new complete snapshot is published.

## Entity: MetricDisplayRule

Formatting and rendering rules applied uniformly across components.

### Fields

- `metricName`: One of `pnl | balance | equity | usedMargin | remainingMargin`.
- `decimalPlaces`: Fixed `2`.
- `roundingMode`: Canonical shared rounding strategy.
- `sourceVersionBinding`: Snapshot version that the metric is bound to.

### Validation Rules

- All targeted metric components must consume the same `sourceVersionBinding` within one render cycle.
- No component may override `decimalPlaces` or `roundingMode` locally for these metrics.
