import { DecryptedMessage, EncryptedMessage, createAAD, decryptMessage } from "../crypto/aes-gcm";

export async function handleIncomingMessage(
  data: {
    from: string; // The sender's ID
    ciphertext: string;
    timestamp: number;
  },
  currentUserId: string, // The recipient's ID
  sessionKey: CryptoKey
): Promise<DecryptedMessage> {
  const encryptedMessage: EncryptedMessage = {
    ciphertext: data.ciphertext,
    timestamp: data.timestamp,
  };

  // Recreate the AAD to verify the message's authenticity.
  // This is a critical security step.
  const aad = createAAD(data.from, currentUserId, data.timestamp);

  const decryptedMessage = await decryptMessage(
    sessionKey,
    encryptedMessage,
    aad
  );

  return decryptedMessage;
}
