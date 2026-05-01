import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

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
  const sessionToken = req.cookies.sessionToken;
  if (!sessionToken) {
    return res.json({
      error: "NO Token Present",
    });
  }
  try {
    const data = jwt.verify(sessionToken, "SECRET") as { userId: string };
    req.userId = data.userId;
    next();
  } catch (error: any) {
    console.log(error);
    return res.json({
      message: "Validation error",
    });
  }
}
