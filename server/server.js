import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import connectDB from "./config/db.js";
import { setupSwagger } from "./config/swagger.js";
import path from "path";
import { fileURLToPath } from "url";
import socketService from "./services/socketService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/post.js";
import userRoutes from "./routes/user.js";
import uploadRoutes from "./routes/upload.js";
import notificationRoutes from "./routes/notification.js";
import chatRoutes from "./routes/chat.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
socketService.initialize(httpServer);

// Middleware to parse JSON
app.use(express.json());

// Enable CORS for all routes with proper credentials handling
app.use(
  cors({
    origin: function (origin, callback) {
      callback(null, true); // Allow any origin
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Create uploads directory if it doesn't exist
import fs from "fs";
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

// Setup Swagger documentation
setupSwagger(app);

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/user", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);

// Error handling middleware
import errorHandler from "./middleware/errorHandler.js";
app.use(errorHandler);

// Server setup
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(
    `API Documentation is available at http://localhost:${PORT}/api-docs`
  );
});

export default app;
