// src/models/user.ts
export interface User {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
  public_key?: string | null;
  created_at?: string;
  // password_hash intentionally not included in public user type returned to client
  password_hash?: string; // internal only
}
