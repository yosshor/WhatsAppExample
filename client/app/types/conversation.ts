export interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: Date;
    readBy: string[];
    type: 'text' | 'image' | 'file';
    reactions?: { [userId: string]: string };
}

export interface Conversation {
    id: string;
    participants: string[];
    lastMessage?: Message;
    createdAt: Date;
    updatedAt: Date;
    type: 'private' | 'group';
    name?: string;
    groupImage?: string;
}

export default Conversation; 