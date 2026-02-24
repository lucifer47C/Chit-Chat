// src/config/db.ts
import { Pool } from "pg";
import { env } from "./env";

export const db = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // required for Supabase pooler in many setups
  },
  max: 6,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

let connected = false;

export async function connectDB(): Promise<void> {
  if (connected) return;
  // simple test query; throws if DB unreachable
  await db.query("SELECT 1");
  connected = true;
  console.log("✅ DB connected");
}

// allow graceful shutdown in hosting environments
export async function closeDB(): Promise<void> {
  try {
    await db.end();
  } catch (e) {
    // ignore
  }
}
