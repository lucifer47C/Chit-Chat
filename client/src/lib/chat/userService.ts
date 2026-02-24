import { getToken } from "../auth/tokenStorage";

export async function fetchUserPublicKey(userId: string) {
  const res = await fetch(
    `http://localhost:3000/api/users/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    }
  );
  return res.json(); // { publicKey }
}