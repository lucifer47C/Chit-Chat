// src/config/env.ts
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().nonempty(),
  PORT: z.coerce.number().default(3000),
  JWT_ACCESS_SECRET: z.string().min(8, "JWT_ACCESS_SECRET must be set"),
  JWT_REFRESH_SECRET: z.string().min(8, "JWT_REFRESH_SECRET must be set"),
});

export const env = envSchema.parse(process.env);
