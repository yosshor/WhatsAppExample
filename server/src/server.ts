import express from "express";
import pool from "./controllers/db/db";
import cors from "cors";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
// import conversationRouter from "./routes/conversation/conversationRouter";
import messageRouter from "./routes/messages/messageRouter";
import { db } from "./config/firebase";
// import userRouter from "./routes/users/usersRouters";
// import usersRouter from "./routes/users/usersRouters";
// import flightsRouter from './routes/flights/flightsRouter';
// import adminRouter from './routes/sysAdmin/adminRouter';
import chatRoutes from "./routes/chatRoutes";
// Load environment variables
config();
import userRoutes from "./routes/users/usersRouters";
import conversationRoutes from "./routes/conversations/conversationRoutes";

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
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// // Socket.IO connection handling
// io.on("connection", (socket: Socket) => {
//   console.log("User connected:", socket.id);

//   socket.on("join_room", (roomId) => {
//     socket.join(roomId);
//     console.log(`User ${socket.id} joined room ${roomId}`);
//   });

//   socket.on("leave_room", (roomId) => {
//     socket.leave(roomId);
//     console.log(`User ${socket.id} left room ${roomId}`);
//   });

//   socket.on("send_message", (data) => {
//     // Broadcast the message to all users in the room except the sender
//     socket.to(data.roomId).emit("receive_message", data.message);
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//   });
// });

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

// API Routes
// const apiRouter = express.Router();
// apiRouter.use("/conversations", conversationRouter);
// apiRouter.use("/messages", messageRouter);
// apiRouter.use("/users", userRouter);

// Routes
app.use("/api", userRoutes);
app.use("/api", conversationRoutes);

// app.use("/api", apiRouter);

// Routes
app.use("/api/chats", chatRoutes);

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

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
  }
);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
