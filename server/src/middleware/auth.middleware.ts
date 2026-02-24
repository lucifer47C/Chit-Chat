/// <reference path="../types/express.d.ts" />
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload;
    if (!payload.sub) {
      return res.sendStatus(401);
    }
    req.userId = payload.sub;
    next();
  } catch {
    res.sendStatus(401);
  }
}
