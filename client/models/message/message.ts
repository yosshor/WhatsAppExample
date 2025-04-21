import { Timestamp } from "firebase/firestore";
import { User } from "../user/user";

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'contact' | 'system';

export interface MessageContent {
    text: string;
    metadata?: Record<string, any>;
}

export default interface Message {
    id: string;
    chatId: string;
    senderId: string;
    type: string;
    content: {
      receiverId: string;
      text: string;
      metadata: object;
      chatId: string;
    };
    replyTo: string;
    readBy: Record<string, any>;
    isForwarded: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}