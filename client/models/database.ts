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

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: Date;
  readBy: string[];
}

export interface Chat {
  id: string;
  type: 'individual' | 'group';
  name?: string;
  participants: string[];
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
  admin?: string; // Only for group chats
} 