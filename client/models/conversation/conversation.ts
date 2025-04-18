import { User } from "../user/user";

export interface Conversation {
    id: string;
    currentUserId: string;
    otherUserId: string;
    lastMessage?: string;
    lastMessageTime?: Date;
    unreadCount?: number;
    nickname?: string;
}