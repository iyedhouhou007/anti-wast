import { io } from "socket.io-client";
import { SOCKET_EVENTS } from "./socketEvents";

class SocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
    this.isInitialized = false;
  }

  initialize(token) {
    if (this.socket && this.socket.connected) {
      return;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    if (!token) {
      console.error("Cannot initialize socket: No token provided");
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      this.socket = io(apiUrl, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
      });

      this.setupEventHandlers();
      this.isInitialized = true;
    } catch (error) {
      console.error("Error initializing socket:", error);
      this.socket = null;
      this.isInitialized = false;
    }
  }

  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      this.reconnectAttempts = 0;
    });

    this.socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
        // Server initiated disconnect, try to reconnect
        this.connect();
      }
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      if (error.message === "Authentication error") {
        console.warn("Socket authentication failed, disconnecting");
        this.disconnect();
      }
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
      if (error.message === "Authentication failed") {
        this.disconnect();
      }
    });
  }

  connect(token) {
    if (!token) {
      console.warn("Cannot connect socket: No token provided");
      return;
    }

    try {
      if (!this.isInitialized) {
        this.initialize(token);
      } else if (this.socket && !this.socket.connected) {
        this.socket.auth = { token };
        this.socket.connect();
      }
    } catch (error) {
      console.error("Error connecting socket:", error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isInitialized = false;
    }
    this.reconnectAttempts = 0;
  }

  emit(event, data) {
    if (!this.socket?.connected) {
      console.warn(`Cannot emit ${event}: Socket not connected`);
      return;
    }
    this.socket.emit(event, data);
  }

  on(event, callback) {
    if (!this.socket) {
      console.warn(`Cannot listen to ${event}: Socket not initialized`);
      return;
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, [callback]);
    } else {
      const callbacks = this.listeners.get(event);
      if (!callbacks.includes(callback)) {
        callbacks.push(callback);
        this.listeners.set(event, callbacks);
      }
    }

    this.socket.on(event, callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.socket) {
      console.warn(
        `Cannot remove listener for ${event}: Socket not initialized`
      );
      return;
    }

    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
        if (callbacks.length === 0) {
          this.listeners.delete(event);
        } else {
          this.listeners.set(event, callbacks);
        }
      }
    }

    this.socket.off(event, callback);
  }

  removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach((callback) => {
          this.socket.off(event, callback);
        });
      });
      this.listeners.clear();
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  // Location-specific events
  updateLocation(location) {
    this.emit(SOCKET_EVENTS.LOCATION_UPDATE, location);
  }

  // Chat-specific events
  sendMessage(message) {
    this.emit(SOCKET_EVENTS.CHAT_MESSAGE, message);
  }

  sendTyping(chatId) {
    this.emit(SOCKET_EVENTS.CHAT_TYPING, { chatId });
  }

  markAsRead(chatId, messageIds) {
    this.emit(SOCKET_EVENTS.CHAT_READ, { chatId, messageIds });
  }

  // Bread-specific events
  notifyBreadCreated(bread) {
    this.emit(SOCKET_EVENTS.BREAD_CREATED, bread);
  }

  notifyBreadReserved(breadId, userId) {
    this.emit(SOCKET_EVENTS.BREAD_RESERVED, { breadId, userId });
  }

  // Chat event handlers
  onNewMessage(callback) {
    this.on(SOCKET_EVENTS.CHAT_MESSAGE_NEW, callback);
  }

  onMessageRead(callback) {
    this.on(SOCKET_EVENTS.CHAT_MESSAGE_READ, callback);
  }

  onTyping(callback) {
    this.on(SOCKET_EVENTS.CHAT_TYPING, callback);
  }

  emitTyping(userId, isTyping) {
    this.emit(SOCKET_EVENTS.CHAT_TYPING, { userId, isTyping });
  }

  // Notification-specific events
  onNewNotification(callback) {
    return this.on(SOCKET_EVENTS.NOTIFICATION_NEW, callback);
  }

  onNotificationRead(callback) {
    return this.on(SOCKET_EVENTS.NOTIFICATION_READ, callback);
  }

  markNotificationRead(notificationId) {
    this.emit(SOCKET_EVENTS.NOTIFICATION_MARK_READ, { notificationId });
  }

  markAllNotificationsRead() {
    this.emit(SOCKET_EVENTS.NOTIFICATION_MARK_ALL_READ);
  }
}

export const socketService = new SocketService();
