import type { AssetSymbols } from "@repo/types";
import { pool } from "./db";

export async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trade(
        time TIMESTAMPTZ NOT NULL,
        ticker TEXT NOT NULL,
        price DOUBLE PRECISION NOT NULL
      ) WITH (
        tsdb.hypertable,
        tsdb.segmentby = 'ticker',
        tsdb.orderby = 'time DESC'
      )
      `);

    await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_trade_ticker_time
        ON trade (ticker, time DESC)
      `);
  } catch (error) {
    console.error("Failed to initialize trade table or index", error);
    throw error;
  }
}

export async function insertTick(ticker: AssetSymbols, price: number) {
  try {
    await pool.query(
      `
      INSERT INTO trade (time, ticker, price)
      VALUES (NOW(), $1, $2) RETURNING *
      `,
      [ticker, price],
    );
  } catch (error) {
    console.error(`Failed to insert tick for ${ticker}`, error);
    throw error;
  }
}

export async function createOneMinCandles() {
  try {
    await pool.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS one_min_candles
      WITH (timescaledb.continuous) AS
      SELECT
        time_bucket('1 minute', time) AS bucket,
        ticker,
        first(price, time) AS open,
        max(price) AS high,
        min(price) AS low,
        last(price, time) AS close
      FROM trade
      GROUP BY bucket, ticker;
      `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_one_min_ticker_bucket
      ON one_min_candles (ticker, bucket DESC)
      `);
  } catch (error) {
    console.error("Failed to create one minute candles view or index", error);
    throw error;
  }

  try {
    await pool.query(`
      SELECT add_continuous_aggregate_policy(
        'one_min_candles',
        start_offset => INTERVAL '1 hour',
        end_offset => INTERVAL '1 minute',
        schedule_interval => INTERVAL '1 minute'
      );
    `);
  } catch (error) {}
}

export async function createFiveMinCandles() {
  try {
    await pool.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS five_min_candles
      WITH (timescaledb.continuous) AS
      SELECT
        time_bucket('5 minutes', time) AS bucket,
        ticker,
        first(price, time) AS open,
        max(price) AS high,
        min(price) AS low,
        last(price, time) AS close
      FROM trade
      GROUP BY bucket, ticker;
      `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_five_min_ticker_bucket
      ON five_min_candles (ticker, bucket DESC);
      `);
  } catch (error) {
    console.error("Failed to create five minute candles view or index", error);
    throw error;
  }

  try {
    await pool.query(`
    SELECT add_continuous_aggregate_policy('five_min_candles',
      start_offset => INTERVAL '5 hour',
      end_offset => INTERVAL '5 minute',
      schedule_interval => INTERVAL '5 minute');
    `);
  } catch (error) {}
}
