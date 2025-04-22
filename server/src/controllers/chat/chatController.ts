import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  documentId,
  setDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import {
  Chat,
  ChatParticipant,
  Message,
  MessageType,
} from "../../models/database";

export class ChatController {
  private readonly chatsRef = collection(db, "chats");
  private readonly participantsRef = collection(db, "chatParticipants");
  private messagesRef = (chatId: string) =>
    collection(db, "chats", chatId, "messages");

  async createChat(
    type: Chat["type"],
    participants: string[],
    name?: string,
    chatId?: string,
    senderId?: string,
    messageId?: string,
    text?: string,
    timestamp?: Timestamp,
    messageType?: MessageType
  ): Promise<string> {
    try {
      console.log("trying to create chat");

      const chatData: Omit<Chat, "id"> = {
        type: type || "individual",
        name: name || "",
        participants,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastMessage: {
          messageId: messageId || "",
          text: text || "",
          senderId: senderId || "",
          timestamp: timestamp || Timestamp.now(),
          type: messageType || MessageType.TEXT,
        },
      };

      const chatRef = chatId ? doc(this.chatsRef, chatId) : doc(this.chatsRef);

      await setDoc(chatRef, chatData);

      return chatRef.id;
    } catch (error) {
      console.error("Error creating chat:", error);
      throw error;
    }
  }

  async sendMessage(
    chatId: string,
    senderId: string,
    type: MessageType,
    content: Message["content"],
    replyTo?: Message["replyTo"]
  ): Promise<string> {
    try {
      console.log("Sending message:", { chatId, senderId, type, content });

      if (!senderId || !content) {
        throw new Error("Missing senderId or content");
      }

      let targetChatId = chatId;

      const chatRef = doc(this.chatsRef, chatId);
      const chatDoc = await getDoc(chatRef);

      if (!chatDoc.exists()) {
        console.log("Chat not found, creating new chat");
        await this.createChat(
          "individual",
          [senderId, chatId],
          "Chat",
          chatId,
          senderId,
          "",
          content.text || "",
          Timestamp.now(),
          MessageType.TEXT
        );
        return "";
      } else {
        const messageData: Omit<Message, "id"> = {
          chatId: targetChatId,
          senderId,
          type,
          content,
          replyTo,
          readBy: {
            [senderId]: {
              readAt: Timestamp.now(),
              deliveredAt: Timestamp.now(),
            },
          },
          isForwarded: false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };

        const messageRef = await addDoc(
          this.messagesRef(targetChatId),
          messageData
        );

        const lastMessage = {
          messageId: messageRef.id,
          text: content.text || "Media message",
          senderId,
          timestamp: messageData.createdAt,
          type,
        };

        await updateDoc(doc(this.chatsRef, targetChatId), {
          lastMessage,
          updatedAt: messageData.createdAt,
        });

        const participantsQuery = query(
          this.participantsRef,
          where("chatId", "==", targetChatId),
          where("userId", "!=", senderId)
        );

        const participantDocs = await getDocs(participantsQuery);
        const updatePromises = participantDocs.docs.map((doc) =>
          updateDoc(doc.ref, {
            unreadCount: (doc.data().unreadCount || 0) + 1,
          })
        );

        await Promise.all(updatePromises);
        return messageRef.id;
      }
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    try {
      const messageRef = doc(this.messagesRef(""), messageId);
      const messageDoc = await getDoc(messageRef);

      if (!messageDoc.exists()) {
        throw new Error("Message not found");
      }

      const messageData = messageDoc.data() as Message;
      const readBy = messageData.readBy || {};
      readBy[userId] = {
        readAt: Timestamp.now(),
        deliveredAt: readBy[userId]?.deliveredAt || Timestamp.now(),
      };

      await updateDoc(messageRef, { readBy });

      const participantQuery = query(
        this.participantsRef,
        where("chatId", "==", messageData.chatId),
        where("userId", "==", userId)
      );

      const participantDocs = await getDocs(participantQuery);
      if (!participantDocs.empty) {
        await updateDoc(participantDocs.docs[0].ref, {
          unreadCount: 0,
          lastReadMessageId: messageId,
        });
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
      throw error;
    }
  }


  async getChatMessages(chatId: string) {
    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'asc'));
  
    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log('messages', messages);
    return messages;
    } catch (error) {
      console.error("Error getting chat messages:", error);
      throw error;
    }
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    try {
      const participantsQuery = query(
        this.participantsRef,
        where("userId", "==", userId)
      );
      const participantDocs = await getDocs(participantsQuery);

      if (participantDocs.empty) {
        return [];
      }

      const chatIds = participantDocs.docs.map((doc) => doc.data().chatId);
      const chatChunks: string[][] = [];
      for (let i = 0; i < chatIds.length; i += 10) {
        chatChunks.push(chatIds.slice(i, i + 10));
      }

      const chatResults = await Promise.all(
        chatChunks.map((chunk) =>
          getDocs(query(this.chatsRef, where(documentId(), "in", chunk)))
        )
      );

      const chatDocs = chatResults.flatMap((result) => result.docs);

      return chatDocs.map((chatDoc) => {
        const chatData = chatDoc.data();
        return {
          id: chatDoc.id,
          type: chatData.type,
          name: chatData.name || "",
          participants: chatData.participants || [],
          admins: chatData.admins,
          createdAt: chatData.createdAt,
          updatedAt: chatData.updatedAt,
          lastMessage: chatData.lastMessage,
        } as Chat;
      });
    } catch (error) {
      console.error("Error fetching user chats:", error);
      throw new Error("Failed to fetch user chats");
    }
  }
}
