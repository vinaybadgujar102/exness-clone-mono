import type { NextFunction, Request, Response } from "express";
import type { ZodAny, ZodType } from "zod";
import { errorResponse } from "../lib/responseFactory";
import { StatusCodes } from "http-status-codes";

export const requestValidator = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      return errorResponse(res, StatusCodes.BAD_REQUEST, "INVALID_REQUEST");
    }
  };
};
