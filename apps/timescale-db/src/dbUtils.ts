import type { AssetPrice, AssetSymbols } from "@repo/types";
import { pool } from "./db";

export async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS trade(
      time TIMESTAMPTZ NOT NULL,
      asset TEXT NOT NULL,
      price DOUBLE PRECISION NOT NULL
    ) WITH (
      tsdb.hypertable,
      tsdb.segmentby = 'ticker',
      tsbd.orderby = 'time DESC'
    )
    `);
}

export async function insertTick(ticker: AssetSymbols, price: number) {
  await pool.query(
    `
    INSERT INTO trade (time, ticker, price)
    VALUES (NOW(), $1, $2) RETURNING *
    `,
    [ticker, price],
  );
}

export async function createOneMinCandles() {
  await pool.query(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS one_min_candles
    WITH (timescaledb.continous) AS
    SELECT
    time_bucket('1 minute', time) AS bucket,
    ticker,
    first(price, time) AS open,
    min(price) AS high,
    max(price) as low,
    last(price, time) as close
    FROM trade
    GROUP BY bucket, ticker;
    `);

  await pool.query(`
    SELECT add_continous_aggregrate_policy('one_min_candles',
    start_offset => INTERVAL '1 hour',
    end_offset => INTERVAL '1 minute',
    schedule_interval => INTERVAL '1 minute');)
    `);
}

export async function createFiveMinCandles() {
  await pool.query(`
    CREATE MATERIALIZED VIEW IF NOT EXISTS five_mins_candles
    WITH (timescaledb.continous) AS
    SELECT
    time_bucket('5 minutes', time) AS bucket,
    ticker,
    first(price, time) AS open,
    min(price) AS high,
    max(price) as low,
    last(price, time) as close
    FROM trade
    GROUP BY bucket, ticker;
    `);

  await pool.query(`
    SELECT add_continuous_aggregate_policy('five_mins_candles',
      start_offset => INTERVAL '5 hour',
      end_offset => INTERVAL '5 minute',
      schedule_interval => INTERVAL '5 minute');
    `);
}
