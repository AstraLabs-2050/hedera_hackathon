// import { Manager } from "socket.io-client";
// import { API_URL, TOKEN_NAME } from "./constant";

import { io } from "socket.io-client";
import { TOKEN_NAME,DEV_URL } from "./constant";
import { parseCookies } from "nookies";


const cokies = parseCookies()
const token = cokies.auth_token ?? "";

export const Socket = io(DEV_URL, {
  extraHeaders: { token },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});