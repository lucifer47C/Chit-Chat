import jwt from "jsonwebtoken";
import { env } from "../config/env";

export function verifyWsToken(token: string): string {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
  return payload.sub as string;
}