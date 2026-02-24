// src/api/keys.controller.ts
/// <reference path="../types/express.d.ts" />
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { db } from "../config/db";

export const keysRouter = Router();

keysRouter.post("/register", authMiddleware, async (req, res, next) => {
  try {
    const publicKey = req.body.publicKey;
    if (!publicKey) return res.status(400).json({ message: "publicKey is required" });

    await db.query("UPDATE users SET public_key = $1 WHERE id = $2", [
      publicKey,
      req.userId,
    ]);

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});
