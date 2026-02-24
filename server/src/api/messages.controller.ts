// src/api/messages.controller.ts
/// <reference path="../types/express.d.ts" />
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { storeMessage } from "../services/message.service";

export const messagesRouter = Router();

messagesRouter.post("/", authMiddleware, async (req, res, next) => {
  try {
    const { receiverId, ciphertext } = req.body;
    if (!receiverId || !ciphertext) {
      return res.status(400).json({ message: "receiverId and ciphertext required" });
    }

    await storeMessage(req.userId, receiverId, Buffer.from(ciphertext, "base64"));
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});
