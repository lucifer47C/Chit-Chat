
import { deriveSharedSecret, deriveSessionKey } from '@/lib/crypto/ecdh';
import { encryptMessage, decryptMessage, EncryptedMessage } from '@/lib/crypto/aes-gcm';
import { KeyPair, importPublicKey, exportKeyPair } from '@/lib/crypto/keys';

export class SecureSession {
  private ourKeyPair: KeyPair;
  private theirPublicKey?: CryptoKey;
  private sessionKey?: CryptoKey;

  constructor(ourKeyPair: KeyPair) {
    if (!ourKeyPair || !ourKeyPair.privateKey || !ourKeyPair.publicKey) {
      throw new Error("Invalid KeyPair provided to SecureSession.");
    }
    this.ourKeyPair = ourKeyPair;
  }

  async establish(theirPublicKeyString: string) {
    try {
        const theirPublicKey = await importPublicKey(theirPublicKeyString);

        this.theirPublicKey = theirPublicKey;
        const sharedSecret = await deriveSharedSecret(this.ourKeyPair.privateKey, this.theirPublicKey);
        this.sessionKey = await deriveSessionKey(sharedSecret);

    } catch (error) {
        console.error("Error establishing secure session:", error);
        throw new Error("Could not establish secure session. The provided public key may be invalid.");
    }
  }

  async encrypt(plaintext: string): Promise<EncryptedMessage> {
    if (!this.sessionKey) {
      throw new Error('Session not established. Cannot encrypt.');
    }
    return encryptMessage(this.sessionKey, plaintext);
  }

  async decrypt(encryptedMessage: EncryptedMessage): Promise<string> {
    if (!this.sessionKey) {
      throw new Error('Session not established. Cannot decrypt.');
    }
    const decrypted = await decryptMessage(this.sessionKey, encryptedMessage);
    return decrypted.plaintext;
  }

  getTheirPublicKey(): CryptoKey | undefined {
    return this.theirPublicKey;
  }
  
  async getTheirPublicKeyAsJwk(): Promise<JsonWebKey | undefined> {
      if(!this.theirPublicKey) return undefined;
      return await window.crypto.subtle.exportKey('jwk', this.theirPublicKey);
  }

  isEstablished(): boolean {
    return !!this.sessionKey;
  }
}
