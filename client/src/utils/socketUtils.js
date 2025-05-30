import io from "socket.io-client";
import { getStoredToken } from "./storageUtils";

let socket = null;

export const SOCKET_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  ERROR: "error",
  NEW_MESSAGE: "new_message",
  NEW_NOTIFICATION: "new_notification",
  POST_UPDATE: "post_update",
  USER_STATUS: "user_status",
};

export const initializeSocket = (serverUrl) => {
  if (socket) return socket;

  const token = getStoredToken();

  socket = io(serverUrl, {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on(SOCKET_EVENTS.CONNECT, () => {
    console.log("Socket connected");
  });

  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    console.log("Socket disconnected");
  });

  socket.on(SOCKET_EVENTS.ERROR, (error) => {
    console.error("Socket error:", error);
  });

  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};

export const emitEvent = (event, data) => {
  if (!socket) {
    throw new Error("Socket not initialized");
  }
  socket.emit(event, data);
};

export const subscribeToEvent = (event, callback) => {
  if (!socket) {
    throw new Error("Socket not initialized");
  }
  socket.on(event, callback);
  return () => socket.off(event, callback);
};

export const getSocketInstance = () => {
  if (!socket) {
    throw new Error("Socket not initialized");
  }
  return socket;
};
