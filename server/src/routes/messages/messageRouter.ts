import express from "express";
import { authenticateUser } from "../../middleware/auth";
import {
  getAllMessages,
  readMessage,
  sendMessage,
} from "../../controllers/messages/messages";

const router = express.Router();

// Send a message
router.post("/:chatId/sendMessage", sendMessage);

// Mark message as read
router.put("/messages/:messageId/read", authenticateUser, readMessage);

// Get all chat messages
router.get("/:chatId/getAllMessages", getAllMessages);

export default router;
