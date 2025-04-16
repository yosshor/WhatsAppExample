import express from "express";
import pool from "./controllers/db/db";
import cors from "cors";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import conversationRouter from "./routes/conversation/conversationRouter";
import messageRouter from "./routes/messges/messageRouter";
import { db } from "./controllers/db/firebaseConfig";
// import usersRouter from "./routes/users/usersRouters";
// import flightsRouter from './routes/flights/flightsRouter';
// import adminRouter from './routes/sysAdmin/adminRouter';

// Load environment variables
config();

const app = express();
const port = 3000;

//middlewares
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ], // Your React app origin
    credentials: true, // Allow cookies to be sent with requests
  })
);

// 🔹 Test Connection
pool
  .getConnection()
  .then(() => console.log("✅ Connected to MySQL Database"))
  .catch((err) => console.error("❌ MySQL Connection Error:", err));

// Check Firestore connection
if (db) {
  console.log("✅ Connected to Firestore");
} else {
  console.error("❌ Firestore Connection Error: Failed to initialize Firestore");
}

const apiRouter = express.Router();
apiRouter.use("/messages", messageRouter);
apiRouter.use("/conversation", conversationRouter);

// apiRouter.use("/users", usersRouter);
// apiRouter.use("/flights", flightsRouter);
// apiRouter.use("/admin", adminRouter);

app.use("/api", apiRouter);

app.get("/", (req: any, res: any) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
