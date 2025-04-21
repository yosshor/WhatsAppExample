import { Router } from "express";
import { ChatController } from "../controllers/chat/chatController";
import { authenticateUser } from "../middleware/auth";

const router = Router();
const chatController = new ChatController();

// Create a new chat
router.post("/", authenticateUser, async (req, res) => {
  try {
    const { type, participants, name } = req.body;
    const chatId = await chatController.createChat(type, participants, name);
    res.status(201).json({ chatId });
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ error: "Failed to create chat" });
  }
});

// Send a message
router.post('/:chatId/sendMessage', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { type, content, replyTo, senderId, receiverId } = req.body;
    console.log('req. params',type, content, replyTo, senderId, receiverId);
    const messageId = await chatController.sendMessage(
      chatId,
      senderId,
      type || 'text', // Default to text type if not specified
      content,
      senderId,
      // replyTo
    );
    res.status(201).json({ messageId });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Mark message as read
router.put("/messages/:messageId/read", authenticateUser, async (req, res) => {
  try {
    const { messageId } = req.params;
    await chatController.markMessageAsRead(messageId, req.user.id);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ error: "Failed to mark message as read" });
  }
});

// Get chat messages
router.get("/:chatId/getAllMessages", async (req, res) => {
  try {
    const { chatId } = req.params;
    const { lastMessageId, pageSize } = req.query;
    console.log('chatId', chatId);
    const messages = await chatController.getChatMessages(
      chatId,
      // lastMessageId as string | undefined,
      // pageSize ? parseInt(pageSize as string) : undefined
    );
    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error getting chat messages:", error);
    res.status(500).json({ error: "Failed to get chat messages" });
  }
});

// Get user's chats
router.get("/user/:userId", authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if the user is requesting their own chats
    if (userId !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to access other user's chats" });
    }

    const chats = await chatController.getUserChats(userId);
    res.status(200).json({ chats });
  } catch (error) {
    console.error("Error getting user chats:", error);
    res.status(500).json({ error: "Failed to get user chats" });
  }
});

export default router;
