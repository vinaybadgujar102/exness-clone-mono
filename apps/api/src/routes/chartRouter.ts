import { Router, type Request, type Response } from "express";
import { pool } from "../lib/timescaledb";

const chartRouter = Router();

chartRouter.get("/", async (req: Request, res: Response) => {
  const { symbol, interval, limit } = req.query;

  if (!symbol || !interval || !limit) {
    return res.json({
      message: "missing data",
    });
  }

  const intervalMap = {
    "1m": "one_min",
    "5m": "five_min",
  };

  const pickedInterval = intervalMap[interval];
  const klines = await pool.query(
    `
    SELECT * FROM ${pickedInterval}_candles
    WHERE ticker = $1
    ORDER BY bucket DESC
    LIMIT $2
    `,
    [symbol, limit],
  );

  const data = klines.rows.map((row) => {
    return {
      open: row.open,
      close: row.close,
      high: row.high,
      low: row.low,
      time: Math.floor(new Date(row.bucket).getTime() / 1000), // convert to unix timestamp
    };
  });
  return res.json({
    data: data.reverse(),
  });
});

export default chartRouter;
