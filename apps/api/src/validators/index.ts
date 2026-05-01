import type { NextFunction, Request, Response } from "express";
import type { ZodAny, ZodType } from "zod";

export const requestValidator = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      throw new Error(error);
    }
  };
};
