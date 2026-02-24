// src/lib/storage/indexeddb.ts
// Minimal IndexedDB wrapper for storing identity backup metadata.
// Keeps code dependency-free.

import { EncryptedKeyBackup } from "../crypto";

const DB_NAME = "chitchat-db";
const STORE_NAME = "keys";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function storeKeyPair(
  id: string,
  backup: EncryptedKeyBackup
): Promise<void> {
  const db = await openDb();

  const record = {
    id,
    publicKey: backup.publicKey,
    encryptedPrivateKey: backup.encryptedPrivateKey,
    salt: backup.salt,
    iv: backup.iv,
    fingerprint: backup.fingerprint,
    createdAt: Date.now(),
  };

  return new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(record);

    request.onsuccess = () => res();
    request.onerror = () => rej(request.error);
  });
}


export async function getKeyPair(id: string) {
  const db = await openDb();
  return new Promise<any>((res, rej) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const r = store.get(id);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

export async function clearAllData() {
  const db = await openDb();
  return new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const r = store.clear();
    r.onsuccess = () => res();
    r.onerror = () => rej(r.error);
  });
}
