import { Timestamp } from 'firebase/firestore';

// User Interface
export interface User {
    id: string;
    phoneNumber: string;
    displayName: string;
    profilePicture?: string;
    status?: string;
    lastSeen: Date;
    isOnline: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Chat (Conversation) Interface
export interface Chat {
    id?: string;
    type: 'individual' | 'group';
    name?: string;
    participants: string[];
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

// Message Types
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

// Message Interface
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

// Chat Participant Status
export interface ChatParticipant {
    chatId: string;
    userId: string;
    unreadCount: number;
    isMuted: boolean;
    isPinned: boolean;
    joinedAt: Timestamp;
    role: 'admin' | 'member';
    lastReadMessageId?: string;
    settings: {
        notifications: boolean;
        mediaAutoDownload: boolean;
    };
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