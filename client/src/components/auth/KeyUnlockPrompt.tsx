// src/components/auth/KeyUnlockPrompt.tsx
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function KeyUnlockPrompt({ onSuccess }: { onSuccess?: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { unlockKeys } = useAuth();

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      await unlockKeys(password);
      onSuccess?.();
    } catch (e: any) {
      if (e.message === "NO_BACKUP_PRESENT") {
        setError("No key backup found. Please re-register.");
      } else if (e.message === "INVALID_PASSWORD" || e.message === "Wrong password") {
        setError("Incorrect password.");
      } else {
        setError(e.message || "Failed to unlock keys.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Unlock Your Identity</h3>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password used during signup"/>
      <button onClick={submit} disabled={loading || !password}>{loading ? "Unlocking..." : "Unlock"}</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}
