import express from "express";
import pool from "./controllers/db/db";
import cors from "cors";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import messageRouter from "./routes/messages/messageRouter";
import { auth, db } from "./config/firebase";
import chatRoutes from "./routes/chats/chatsRouter";
import userRoutes from "./routes/users/usersRouters";
import conversationRoutes from "./routes/conversations/conversationRoutes";

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://192.168.33.11:8081",
      "http://localhost:8081",
      "http://192.168.33.14",
      "http://172.20.60.65:8081",
      'http://localhost:3000'
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://192.168.33.11:8081",
      "http://localhost:8081",
      "http://192.168.33.14",
      "http://172.20.60.65:8081",
      'http://localhost:3000'
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


// 🔹 Test Connection pool
pool
  .getConnection()
  .then(() => console.log("✅ Connected to MySQL Database"))
  .catch((err: Error) => console.error("❌ MySQL Connection Error:", err));

// Check Firestore connection
if (db) {
  console.log("✅ Connected to Firestore");
} else {
  console.error(
    "❌ Firestore Connection Error: Failed to initialize Firestore"
  );
}


// Routes
app.use("/api", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use('/api/messages', messageRouter)
app.use("/api/chats", chatRoutes);
app.get("/api/auth/user", (req, res) => {
  const authUser = auth;
  res.json({ auth: authUser });
});

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  }
);


httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
