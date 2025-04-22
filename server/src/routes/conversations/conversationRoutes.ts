import express from "express";
import {
  createConversation,
  getConversationByUserId,
  getConversationMessages,
  sendConversationMessage,
  updateConversation,
} from "../../controllers/conversation/conversation";

const router = express.Router();

router
  .post("", createConversation)
  .get("/:userId", getConversationByUserId)
  .get("/:conversationId/messages", getConversationMessages)
  .post("/:conversationId/messages", sendConversationMessage)
  .patch("/:id", updateConversation);

export default router;
