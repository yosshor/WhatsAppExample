import { User } from "../user/user";

export default interface Message {
    id: string;
    text: string;
    senderId: string;
    receiverId: string;
    conversationId: string;
    timestamp: Date;
    read: boolean;
    sender?: {
        id: string;
        name: string;
        profileImage?: string;
    };
}