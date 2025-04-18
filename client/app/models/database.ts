import { Timestamp } from 'firebase/firestore';

export enum MessageType {
    TEXT = 'text',
    IMAGE = 'image',
    VIDEO = 'video',
    AUDIO = 'audio',
    FILE = 'file',
    LOCATION = 'location',
    CONTACT = 'contact',
    SYSTEM = 'system'
}

export interface Chat {
    id?: string;
    type: 'individual' | 'group';
    name?: string;
    participants: string[];
    admins?: string[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
    lastMessage?: {
        messageId: string;
        text: string;
        senderId: string;
        timestamp: Timestamp;
        type: MessageType;
    };
}

export interface Message {
    id?: string;
    chatId: string;
    senderId: string;
    type: MessageType;
    content: MessageContent;
    readBy: {
        [userId: string]: {
            readAt: Timestamp;
            deliveredAt: Timestamp;
        };
    };
    replyTo?: {
        messageId: string;
        content: string;
        senderId: string;
    };
    isForwarded: boolean;
    reactions?: {
        [userId: string]: string;
    };
    createdAt: Timestamp;
    updatedAt: Timestamp;
    deletedAt?: Timestamp;
}

export interface MessageContent {
    text?: string;
    mediaUrl?: string;
    mediaType?: string;
    thumbnailUrl?: string;
    duration?: number;
    location?: {
        latitude: number;
        longitude: number;
        address?: string;
    };
    contact?: {
        name: string;
        phoneNumber: string;
        email?: string;
    };
} 