import express from "express";
import { authenticateUser } from "../../middleware/auth";
import {
  getAllMessages,
  readMessage,
  sendMessage,
} from "../../controllers/messages/messages";
import { createNewChat } from "../../controllers/chat/chatController";

const router = express.Router();

// Send a message
router.post("/:chatId/sendMessage", sendMessage);

// Mark message as read
router.put("/:messageId/read", authenticateUser, readMessage);

// Get all chat messages
router.get("/:chatId/getAllMessages", getAllMessages);

// Create a new chat
router.post("/createNewChat", authenticateUser, createNewChat);

export default router;
