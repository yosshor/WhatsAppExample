import { db } from '../../config/firebase';
import { collection, doc, getDoc, setDoc, query, where, getDocs, orderBy, limit, updateDoc } from 'firebase/firestore';
import { User } from '../../models/user';

interface Message {
    id: string;
    senderId: string;
    content: string;
    timestamp: Date;
    readBy: string[];
    type: 'text' | 'image' | 'file';
    reactions?: { [userId: string]: string };
}

interface Conversation {
    id: string;
    participants: string[];
    lastMessage?: Message;
    createdAt: Date;
    updatedAt: Date;
    type: 'private' | 'group';
    name?: string; // For group chats
    groupImage?: string; // For group chats
}

class ConversationService {
    private conversationsRef = collection(db, 'conversations');
    private messagesRef = (conversationId: string) => collection(db, `conversations/${conversationId}/messages`);

    async createConversation(participants: string[], type: 'private' | 'group' = 'private', name?: string): Promise<string> {
        const conversationData: Conversation = {
            id: doc(collection(db, 'conversations')).id,
            participants,
            createdAt: new Date(),
            updatedAt: new Date(),
            type,
            name
        };

        await setDoc(doc(this.conversationsRef, conversationData.id), conversationData);
        return conversationData.id;
    }

    async getConversation(conversationId: string): Promise<Conversation | null> {
        const conversationDoc = await getDoc(doc(this.conversationsRef, conversationId));
        return conversationDoc.exists() ? conversationDoc.data() as Conversation : null;
    }

    async getUserConversations(userId: string): Promise<Conversation[]> {
        const q = query(
            this.conversationsRef,
            where('participants', 'array-contains', userId),
            orderBy('updatedAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as Conversation);
    }

    async sendMessage(conversationId: string, senderId: string, content: string, type: 'text' | 'image' | 'file' = 'text'): Promise<string> {
        const messageData: Message = {
            id: doc(collection(db, 'temp')).id,
            senderId,
            content,
            timestamp: new Date(),
            readBy: [senderId],
            type
        };

        await setDoc(doc(this.messagesRef(conversationId), messageData.id), messageData);
        
        // Update conversation's last message and timestamp
        await setDoc(doc(this.conversationsRef, conversationId), {
            lastMessage: messageData,
            updatedAt: new Date()
        }, { merge: true });

        return messageData.id;
    }

    async getMessages(conversationId: string, limit: number = 50): Promise<Message[]> {
        const q = query(
            this.messagesRef(conversationId),
            orderBy('timestamp', 'desc'),
            // limit(limit)
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => doc.data() as Message);
    }

    async updateConversation(conversationId: string, nickname?: string, lastMessage?: Message): Promise<boolean> {
            try {
                const conversationRef = doc(db, 'conversations', conversationId);
                const conversationDoc = await getDoc(conversationRef);
        
                if (!conversationDoc.exists()) {
                    throw new Error('Conversation not found');
                }
        
                const updates: any = {
                    updatedAt: new Date()
                };
                
                if (nickname !== undefined) updates.nickname = nickname;
                if (lastMessage !== undefined) updates.lastMessage = lastMessage;
        
                await updateDoc(conversationRef, updates);
                return true;
            } catch (error) {
                console.error('Error updating conversation:', error);
                throw new Error('Failed to update conversation');
            }
        }
}

export default new ConversationService(); 