// src/lib/crypto/keys.ts
// WebCrypto-based identity key generation, export/import, backup & restore
// Uses ECDH P-256 for compatibility with WebCrypto

export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicKeyRaw: ArrayBuffer;
  fingerprint: string;
}

export interface ExportedKeyPair {
  publicKey: string; // base64 raw
  privateKey: string; // JSON string JWK
  fingerprint: string;
}

export interface EncryptedKeyBackup {
  encryptedPrivateKey: string; // base64
  salt: string; // base64
  iv: string; // base64
  publicKey: string; // base64
  fingerprint: string;
}

/* ---------------- helpers ---------------- */

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function generateRandomBytes(len: number): Uint8Array {
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  return buf;
}

/* ---------------- key generation ---------------- */

export async function generateIdentityKeyPair(): Promise<KeyPair> {
  const kp = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey", "deriveBits"]
  );

  const publicKeyRaw = await crypto.subtle.exportKey("raw", kp.publicKey);
  const fingerprint = arrayBufferToBase64(publicKeyRaw).slice(0, 24);

  return {
    publicKey: kp.publicKey,
    privateKey: kp.privateKey,
    publicKeyRaw,
    fingerprint,
  };
}

/* ---------------- export / import helpers ---------------- */

export async function exportKeyPair(keyPair: KeyPair): Promise<ExportedKeyPair> {
  const publicRaw = await crypto.subtle.exportKey("raw", keyPair.publicKey);
  const privateJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);

  return {
    publicKey: arrayBufferToBase64(publicRaw),
    privateKey: JSON.stringify(privateJwk),
    fingerprint: keyPair.fingerprint,
  };
}

export async function importKeyPair(exported: ExportedKeyPair): Promise<KeyPair> {
  const publicKeyRaw = base64ToArrayBuffer(exported.publicKey);
  const privateKeyJwk = JSON.parse(exported.privateKey);

  const publicKey = await crypto.subtle.importKey(
    "raw",
    publicKeyRaw,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );

  const privateKey = await crypto.subtle.importKey(
    "jwk",
    privateKeyJwk,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey", "deriveBits"]
  );

  return {
    publicKey,
    privateKey,
    publicKeyRaw,
    fingerprint: exported.fingerprint,
  };
}

export async function exportPublicKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", key);
  return arrayBufferToBase64(raw);
}

export async function importPublicKey(base64PublicKey: string): Promise<CryptoKey> {
  const publicKeyRaw = base64ToArrayBuffer(base64PublicKey);
  return crypto.subtle.importKey(
    "raw",
    publicKeyRaw,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );
}

/* ---------------- password derived key ---------------- */

async function derivePasswordKey(password: string, saltBytes: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();

  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  // Force a plain ArrayBuffer for strict TS typings
  const salt = saltBytes.slice().buffer as ArrayBuffer;

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 200_000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/* ---------------- create backup ---------------- */

export async function createKeyBackup(keyPair: KeyPair, password: string): Promise<EncryptedKeyBackup> {
  const salt = generateRandomBytes(16);
  const iv = generateRandomBytes(12);

  const pwKey = await derivePasswordKey(password, salt);

  const jwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
  const plaintext = new TextEncoder().encode(JSON.stringify(jwk));

  // Use ArrayBuffer for IV
  const ivBuffer = iv.slice().buffer as ArrayBuffer;

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: ivBuffer },
    pwKey,
    plaintext
  );

  return {
    encryptedPrivateKey: arrayBufferToBase64(encrypted),
    salt: arrayBufferToBase64(salt.slice().buffer as ArrayBuffer),
    iv: arrayBufferToBase64(ivBuffer),
    publicKey: arrayBufferToBase64(keyPair.publicKeyRaw),
    fingerprint: keyPair.fingerprint,
  };
}

/* ---------------- restore ---------------- */

export async function restoreKeyFromBackup(backup: EncryptedKeyBackup, password: string): Promise<KeyPair> {
  if (!backup?.encryptedPrivateKey) {
    throw new Error("NO_BACKUP_PRESENT");
  }

  const salt = new Uint8Array(base64ToArrayBuffer(backup.salt));
  const iv = new Uint8Array(base64ToArrayBuffer(backup.iv));
  const encrypted = base64ToArrayBuffer(backup.encryptedPrivateKey);

  const pwKey = await derivePasswordKey(password, salt);

  let decrypted: ArrayBuffer;
  try {
    decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv.slice().buffer as ArrayBuffer },
      pwKey,
      encrypted
    );
  } catch {
    throw new Error("INVALID_PASSWORD");
  }

  const jwk = JSON.parse(new TextDecoder().decode(decrypted));

  const privateKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey", "deriveBits"]
  );

  const publicKeyRaw = base64ToArrayBuffer(backup.publicKey);
  const publicKey = await crypto.subtle.importKey(
    "raw",
    publicKeyRaw,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );

  return {
    publicKey,
    privateKey,
    publicKeyRaw,
    fingerprint: backup.fingerprint,
  };
}
