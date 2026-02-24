import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

import { authService } from "@/lib/auth/authService";
import type {
  User,
  LoginCredentials,
  SignupCredentials,
} from "@/lib/auth/types";

import {
  storeTokens,
  storeUser,
  getStoredTokens,
  getStoredUser,
  clearAuthData,
  isTokenExpired,
} from "@/lib/auth/tokenStorage";

import {
  generateIdentityKeyPair,
  createKeyBackup,
  restoreKeyFromBackup,
  type KeyPair,
} from "@/lib/crypto/keys";

import {
  storeKeyPair,
  getKeyPair as getDbKeyPair,
  clearAllData,
} from "@/lib/storage/indexeddb";

/* ---------------- internal crypto cache ---------------- */

let currentKeyPair: KeyPair | null = null;

/* ---------------- state ---------------- */

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  isAuthLoading: boolean;
  isCryptoLoading: boolean;
  isCryptoReady: boolean;

  needsIdentitySetup: boolean;
  needsKeyBackup: boolean;
  needsKeyUnlock: boolean;

  authError: string | null;
  cryptoError: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,

  isAuthLoading: true,
  isCryptoLoading: false,
  isCryptoReady: false,

  needsIdentitySetup: false,
  needsKeyBackup: false,
  needsKeyUnlock: false,

  authError: null,
  cryptoError: null,
};

type Action =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; user: User; token: string }
  | { type: "AUTH_FAILURE"; error: string }
  | { type: "AUTH_LOGOUT" }
  | { type: "CRYPTO_START" }
  | { type: "CRYPTO_SUCCESS" }
  | { type: "CRYPTO_NEEDS_SETUP" }
  | { type: "CRYPTO_NEEDS_BACKUP"; keyPair: KeyPair }
  | { type: "CRYPTO_NEEDS_UNLOCK" }
  | { type: "CRYPTO_FAILURE"; error: string }
  | { type: "CLEAR_ERRORS" };  ;

function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, isAuthLoading: true, authError: null };

    case "AUTH_SUCCESS":
      return {
        ...state,
        isAuthLoading: false,
        isAuthenticated: true,
        user: action.user,
        token: action.token,
      };

    case "AUTH_FAILURE":
      return { ...state, isAuthLoading: false, authError: action.error };

    case "AUTH_LOGOUT":
      return { ...initialState, isAuthLoading: false };

    case "CRYPTO_START":
      return { ...state, isCryptoLoading: true, cryptoError: null };

    case "CRYPTO_SUCCESS":
      return {
        ...state,
        isCryptoLoading: false,
        isCryptoReady: true,
        needsIdentitySetup: false,
        needsKeyBackup: false,
        needsKeyUnlock: false,
      };

    case "CRYPTO_NEEDS_SETUP":
      return { ...state, needsIdentitySetup: true, isCryptoLoading: false };

    case "CRYPTO_NEEDS_BACKUP":
      currentKeyPair = action.keyPair;
      return { ...state, needsKeyBackup: true, isCryptoLoading: false };

    case "CRYPTO_NEEDS_UNLOCK":
      return { ...state, needsKeyUnlock: true, isCryptoLoading: false };

    case "CRYPTO_FAILURE":
      return {
        ...state,
        isCryptoLoading: false,
        cryptoError: action.error,
      };

    case "CLEAR_ERRORS":
      return {
        ...state,
        authError: null,
        cryptoError: null,
      };

    default:
      return state;
  }
}

/* ---------------- context type ---------------- */

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  unlockKeys: (password: string) => Promise<void>;
  setupIdentity: (password: string) => Promise<void>;
  getKeyPair: () => KeyPair | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

/* ---------------- provider ---------------- */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  /* -------- initial auth restore -------- */

  useEffect(() => {
    const tokens = getStoredTokens();
    const user = getStoredUser();

    if (tokens && user && !isTokenExpired(tokens.accessToken)) {
      dispatch({
        type: "AUTH_SUCCESS",
        user,
        token: tokens.accessToken,
      });
    } else {
      dispatch({ type: "AUTH_LOGOUT" });
    }
  }, []);

  /* -------- crypto loader -------- */

  useEffect(() => {
    if (
      !state.isAuthenticated ||
      state.isCryptoReady ||
      state.needsIdentitySetup ||
      state.needsKeyUnlock
    ) {
      return;
    }

    (async () => {
      dispatch({ type: "CRYPTO_START" });
      const stored = await getDbKeyPair("identity");
      dispatch({ type: stored ? "CRYPTO_NEEDS_UNLOCK" : "CRYPTO_NEEDS_SETUP" });
    })();
  }, [state.isAuthenticated]);

  /* ---------------- AUTH METHODS ---------------- */

  const clearError = () => {
    dispatch({ type: "CLEAR_ERRORS" });
  };


  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: "AUTH_START" });

    try {
      const response = await authService.login(credentials);

      storeTokens(response.tokens);
      storeUser(response.user);

      dispatch({
        type: "AUTH_SUCCESS",
        user: response.user,
        token: response.tokens.accessToken,
      });
    } catch (error: any) {
      dispatch({
        type: "AUTH_FAILURE",
        error: error.message || "Login failed",
      });
      throw error;
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    dispatch({ type: "AUTH_START" });

    try {
      const response = await authService.register(credentials);

      storeTokens(response.tokens);
      storeUser(response.user);

      dispatch({
        type: "AUTH_SUCCESS",
        user: response.user,
        token: response.tokens.accessToken,
      });
    } catch (error: any) {
      dispatch({
        type: "AUTH_FAILURE",
        error: error.message || "Signup failed",
      });
      throw error;
    }
  };

  const logout = async () => {
    currentKeyPair = null;
    await clearAllData();
    clearAuthData();
    dispatch({ type: "AUTH_LOGOUT" });
  };

  /* ---------------- CRYPTO METHODS ---------------- */

  const setupIdentity = useCallback(async (password: string) => {
    dispatch({ type: "CRYPTO_START" });

    try {
      const keyPair = await generateIdentityKeyPair();
      const backup = await createKeyBackup(keyPair, password);

      await storeKeyPair("identity", backup);

      currentKeyPair = keyPair;

      dispatch({ type: "CRYPTO_SUCCESS" });
    } catch (err: any) {
      dispatch({
        type: "CRYPTO_FAILURE",
        error: "Identity setup failed",
      });
      throw err;
    }
  }, []);

  const unlockKeys = useCallback(async (password: string) => {
    dispatch({ type: "CRYPTO_START" });

    try {
      const stored = await getDbKeyPair("identity");
      if (!stored) throw new Error("NO_BACKUP_PRESENT");

      currentKeyPair = await restoreKeyFromBackup(stored, password);

      dispatch({ type: "CRYPTO_SUCCESS" });
    } catch (err: any) {
      dispatch({
        type: "CRYPTO_FAILURE",
        error: "Invalid password",
      });
      throw err;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
        unlockKeys,
        setupIdentity,
        getKeyPair: () => (state.isCryptoReady ? currentKeyPair : null),
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ---------------- hook ---------------- */

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
