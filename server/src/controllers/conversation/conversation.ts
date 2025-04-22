import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import conversationService from "./ConversationService";

// Get conversation details
export const getConversation = async (req: any, res: any) => {
  try {
    const { conversationId } = req.params;
    console.log("conversationId", conversationId);
    const conversationRef = collection(db, "conversations");
    const q = query(conversationRef, where("id", "==", conversationId));

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const conversation = snapshot.docs[0].data();
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
};

export const createConversation = async (req: any, res: any) => {
  try {
    const { participants, type, name } = req.body;
    const conversationId = await conversationService.createConversation(
      participants,
      type,
      name
    );
    res.json({ conversationId });
  } catch (error) {
    res.status(500).json({ error: "Failed to create conversation" });
  }
};
export const getConversationByUserId = async (req: any, res: any) => {
  try {
    const conversations = await conversationService.getUserConversations(
      req.params.userId
    );
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

export const getConversationMessages = async (req: any, res: any) => {
  try {
    const messages = await conversationService.getMessages(
      req.params.conversationId
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const sendConversationMessage = async (req: any, res: any) => {
  try {
    const { senderId, content, type } = req.body;
    const messageId = await conversationService.sendMessage(
      req.params.conversationId,
      senderId,
      content,
      type
    );
    res.json({ messageId });
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
};

export const updateConversation = async (req: any, res: any) => {
  try {
    const { nickname, lastMessage } = req.body;
    const update = await conversationService.updateConversation(
      req.params.conversationId,
      nickname,
      lastMessage
    );
    res.json(update);
  } catch (error) {
    res.status(500).json({ error: "Failed to update conversation" });
  }
};
