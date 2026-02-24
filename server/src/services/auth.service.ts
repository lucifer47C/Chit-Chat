// src/services/auth.service.ts
import bcrypt from "bcrypt";
import { db } from "../config/db";
import { signAccessToken, signRefreshToken } from "../config/jwt";

export async function createUser(
  email: string,
  password: string,
  username: string,
  displayName?: string
) {
  const passwordHash = await bcrypt.hash(password, 12);

  // ensure INSERT SQL is correct and returns the fields you expect
  const res = await db.query(
    `INSERT INTO users (email, password_hash, username, display_name)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, username, display_name, created_at`,
    [email, passwordHash, username, displayName || null]
  );

  const user = res.rows[0];

  return {
    user,
    accessToken: signAccessToken(user.id),
    refreshToken: signRefreshToken(user.id),
  };
}

export async function authenticateUser(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
