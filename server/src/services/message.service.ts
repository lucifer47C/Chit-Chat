import { db } from "../config/db";

export async function storeMessage(
  senderId: string,
  receiverId: string,
  ciphertext: Buffer
) {
  await db.query(
    `INSERT INTO messages (sender_id, receiver_id, ciphertext)
     VALUES ($1, $2, $3)`,
    [senderId, receiverId, ciphertext]
  );
}
