// src/services/user.service.ts
import { db } from "../config/db";
import { User } from "../models/user";

export async function findUserByEmail(email: string): Promise<User | null> {
  const res = await db.query(
    `SELECT id, email, password_hash, username, display_name, public_key, created_at
     FROM users
     WHERE email = $1`,
    [email]
  );
  return res.rows[0] || null;
}

export async function findUserById(id: string): Promise<User | null> {
  const res = await db.query(
    `SELECT id, email, username, display_name, public_key, created_at
     FROM users
     WHERE id = $1`,
    [id]
  );
  return res.rows[0] || null;
}
