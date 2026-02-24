import { createAAD, encryptMessage } from "../crypto/aes-gcm";
import { sendSocketMessage } from "../websocket/socket";

export async function sendMessage(
  senderId: string,
  recipientId: string,
  plaintext: string,
  sessionKey: CryptoKey
) {
  const encryptedMessage = await encryptMessage(
    sessionKey,
    plaintext,
    createAAD(senderId, recipientId, Date.now())
  );

  sendSocketMessage({
    type: "message",
    to: recipientId,
    ...encryptedMessage,
  });
}
