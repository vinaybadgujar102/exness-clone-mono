import { Router, type Request, type Response } from "express";
import { pool } from "../lib/timescaledb";
import { ASSETSCONFIG, AssetSymbols } from "@repo/types";

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

  const priceScale = ASSETSCONFIG[symbol as AssetSymbols].priceScale;

  const data = klines.rows.map((row) => {
    return {
      open: row.open / priceScale,
      close: row.close / priceScale,
      high: row.high / priceScale,
      low: row.low / priceScale,
      time: Math.floor(new Date(row.bucket).getTime() / 1000),
    };
  });

  return res.json({
    data: data.reverse(),
  });
});

export default chartRouter;
