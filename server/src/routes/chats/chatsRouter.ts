import express from "express";
import { authenticateUser } from "../../middleware/auth";
import { createNewChat } from "../../controllers/chat/chatController";

const router = express.Router();

// Create a new chat
router.post("/createNewChat", authenticateUser, createNewChat);

export default router;
