// src/lib/auth/tokenStorage.ts
// Simple localStorage-backed helpers for tokens & user

const ACCESS_KEY = "chitchat_access";
const REFRESH_KEY = "chitchat_refresh";
const USER_KEY = "chitchat_user";

export function storeTokens({ accessToken, refreshToken }: { accessToken: string; refreshToken: string; }) {
  localStorage.setItem(ACCESS_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function getStoredTokens(): { accessToken: string; refreshToken: string } | null {
  const a = localStorage.getItem(ACCESS_KEY);
  const r = localStorage.getItem(REFRESH_KEY);
  return a && r ? { accessToken: a, refreshToken: r } : null;
}

export function storeUser(user: any) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser() {
  const s = localStorage.getItem(USER_KEY);
  return s ? JSON.parse(s) : null;
}

export function clearAuthData() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

/** Very small JWT exp check (assumes JWT structure) */
export function isTokenExpired(token?: string | null) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp;
    if (!exp) return false;
    return Date.now() / 1000 > exp;
  } catch {
    return true;
  }
}
