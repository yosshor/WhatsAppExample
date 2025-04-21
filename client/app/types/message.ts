import { User } from './user';

export interface Message {
    id: string;
    chatId: string;
    sender: User;
    content: string;
    timestamp: Date;
    readBy: string[]; // array of user IDs who have read the message
    attachments?: {
        type: 'image' | 'video' | 'audio' | 'document';
        url: string;
        name?: string;
        size?: number;
    }[];
    replyTo?: Message;
    isDeleted?: boolean;
} 