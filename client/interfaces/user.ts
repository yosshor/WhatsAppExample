export interface User {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
    status?: 'online' | 'offline' | 'away';
    lastSeen?: Date;
    bio?: string;
    phoneNumber?: string;
}

export interface UserChat {
    userId: string;
    conversationId: string;
    nickname?: string;
    isMuted?: boolean;
    isArchived?: boolean;
    lastReadMessageId?: string;
} 