import { Router, type Request, type Response } from "express";
import { pool } from "../lib/timescaledb";
import { ASSETSCONFIG, AssetSymbols } from "@repo/types";
import { StatusCodes } from "http-status-codes";
import { errorResponse, successResponse } from "../lib/responseFactory";

const chartRouter = Router();

chartRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { symbol, interval, limit } = req.query;

    if (!symbol || !interval || !limit) {
      return errorResponse(res, StatusCodes.BAD_REQUEST, "MISSING_DATA");
    }

    const intervalMap = {
      "1m": "one_min",
      "5m": "five_min",
    };

    const pickedInterval = intervalMap[interval as keyof typeof intervalMap];
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

    return successResponse(res, StatusCodes.OK, {
      data: data.reverse(),
    });
  } catch (error) {
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "INTERNAL_SERVER_ERROR",
    );
  }
});

export default chartRouter;
