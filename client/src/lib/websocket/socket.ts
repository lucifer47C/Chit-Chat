import { getToken } from "../auth/tokenStorage";

let socket: WebSocket;

export function connectSocket() {
  const token = getToken();
  socket = new WebSocket(`ws://localhost:3000?token=${token}`);
  return socket;
}

export function sendSocketMessage(payload: any) {
  socket.send(JSON.stringify(payload));
}
