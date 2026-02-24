// src/api/auth.controller.ts
import { Router } from "express";
import { findUserByEmail, findUserById } from "../services/user.service";
import { createUser, authenticateUser } from "../services/auth.service";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../config/jwt";

const authRouter = Router();

/* ---------------- REGISTER ---------------- */

authRouter.post("/register", async (req, res, next) => {
  try {
    const { email, password, username, displayName } = req.body;

    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ message: "Email, password, and username are required" });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    const { user, accessToken, refreshToken } = await createUser(
      email,
      password,
      username,
      displayName
    );

    return res.status(201).json({
      user,
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
});

/* ---------------- LOGIN ---------------- */

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await authenticateUser(password, user.password_hash || "");
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);

    const { password_hash, ...userSafe } = user as any;

    return res.json({
      user: userSafe,
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
});

/* ---------------- REFRESH ---------------- */

authRouter.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res
        .status(400)
        .json({ message: "Refresh token required" });
    }

    let decoded: any;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = signAccessToken(user.id);

    const { password_hash, ...userSafe } = user as any;

    return res.json({
      user: userSafe,
      tokens: {
        accessToken: newAccessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default authRouter;
