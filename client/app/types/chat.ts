import { User } from './user';
import { Message } from './message';

export interface Chat {
    id: string;
    participants: User[];
    messages: Message[];
    lastMessage?: Message;
    createdAt: Date;
    updatedAt: Date;
    isGroupChat: boolean;
    groupName?: string;
    groupImage?: string;
    groupAdmins?: string[]; // array of user IDs who are admins
} 