// src/lib/auth/authService.ts
// Minimal fetch wrapper for backend auth endpoints.

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function jsonOrThrow(res: Response) {
  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const msg = data?.message || res.statusText || "Request failed";
      const err: any = new Error(msg);
      err.status = res.status;
      err.body = data;
      throw err;
    }
    return data;
  } catch (e) {
    if (!res.ok) {
      const err: any = new Error(text || "Request failed");
      err.status = res.status;
      throw err;
    }
    return null;
  }
}

export const authService = {
  async register({ email, password, username, displayName }: any) {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, username, displayName }),
    });
    return jsonOrThrow(res);
  },

  async login({ email, password }: any) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return jsonOrThrow(res);
  },

  async refresh(refreshToken: string) {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    return jsonOrThrow(res);
  },
};
