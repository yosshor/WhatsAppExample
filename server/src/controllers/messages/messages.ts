import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { addDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { ChatController } from "../chat/chatClass";
import { SocketService } from "../socket/socketService";
const chatController = new ChatController();
const socketService = new SocketService("android");

// Send a new message
export const sendMessage = async (req: any, res: any) => {
  try {
    socketService.sendMessage(req.body.message, req.body.chatId);

    const { chatId } = req.params;
    const { type, content, replyTo, senderId, receiverId } = req.body;
    console.log("req. params", type, content, replyTo, senderId, receiverId);
    const messageId = await chatController.sendMessage(
      chatId,
      senderId,
      type || "text",
      content,
      senderId
    );
    res.status(201).json({ messageId });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Get messages for a conversation
export const getAllMessages = async (req: any, res: any) => {
  try {
    const { chatId } = req.params;
    const { lastMessageId, pageSize } = req.query;
    socketService.joinRoom(chatId);

    console.log("chatId", chatId);
    const messages = await chatController.getChatMessages(chatId);
    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error getting chat messages:", error);
    res.status(500).json({ error: "Failed to get chat messages" });
  }
};

export const readMessage = async (req: any, res: any) => {
  try {
    const { messageId } = req.params;
    await chatController.markMessageAsRead(messageId, req.user.id);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ error: "Failed to mark message as read" });
  }
};
