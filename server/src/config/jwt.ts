import jwt from 'jsonwebtoken';
import { env } from './env';

export function signAccessToken(userId: string) {
  return jwt.sign({ id: userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: '1h',
  });
}

export function signRefreshToken(userId: string) {
  return jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}
