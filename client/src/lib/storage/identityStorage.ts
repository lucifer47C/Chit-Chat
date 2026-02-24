
const IDENTITY_PRIVATE_KEY = "identity_private_key";
const IDENTITY_PUBLIC_KEY = "identity_public_key";

export function saveIdentityKeys(privateKey: string, publicKey: string) {
  localStorage.setItem(IDENTITY_PRIVATE_KEY, privateKey);
  localStorage.setItem(IDENTITY_PUBLIC_KEY, publicKey);
}

export function getIdentityPrivateKey() {
  return localStorage.getItem(IDENTITY_PRIVATE_KEY);
}

export function getIdentityPublicKey() {
  return localStorage.getItem(IDENTITY_PUBLIC_KEY);
}
