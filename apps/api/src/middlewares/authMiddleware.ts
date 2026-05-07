import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { errorResponse } from "../lib/responseFactory";
import { StatusCodes } from "http-status-codes";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.log(req.cookies);
  const sessionToken = req.cookies.sessionToken;
  if (!sessionToken) {
    return res.json({
      error: "NO Token Present",
    });
  }
  try {
    const data = jwt.verify(sessionToken, process.env.JWT_SECRET as string) as {
      userId: string;
    };
    req.userId = data.userId;
    next();
  } catch (error: any) {
    errorResponse(res, StatusCodes.UNAUTHORIZED, "SESSION_TOKEN_INVALID");
  }
}
