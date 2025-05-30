import { Server } from "socket.io";
import jwt from "jsonwebtoken";

class SocketService {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // userId -> Set of socket ids
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        // Using a function to allow any origin but still properly handle credentials
        // This is more permissive but still works with credentials: true
        origin: (origin, callback) => {
          callback(null, true); // Allow any origin
        },
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
      },
    });

    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
      } catch (err) {
        next(new Error("Authentication error"));
      }
    });

    this.io.on("connection", (socket) => {
      console.log(`User connected: ${socket.userId}`);

      // Add socket to user's socket set
      if (!this.userSockets.has(socket.userId)) {
        this.userSockets.set(socket.userId, new Set());
      }
      this.userSockets.get(socket.userId).add(socket.id);

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.userId}`);
        const userSockets = this.userSockets.get(socket.userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            this.userSockets.delete(socket.userId);
          }
        }
      });
    });
  }

  emitToUser(userId, event, data) {
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      for (const socketId of userSockets) {
        this.io.to(socketId).emit(event, data);
      }
    }
  }

  emitToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }

  broadcastToAll(event, data) {
    this.io.emit(event, data);
  }
}

export default new SocketService();
