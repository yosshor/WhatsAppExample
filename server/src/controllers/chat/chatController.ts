import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    limit, 
    startAfter,
    addDoc,
    updateDoc,
    serverTimestamp,
    Timestamp,
    DocumentReference,
    DocumentData,
    QueryDocumentSnapshot,
    documentId
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Chat, ChatParticipant, Message, MessageType } from '../../models/database';

export class ChatController {
    private readonly chatsRef = collection(db, 'chats');
    private readonly participantsRef = collection(db, 'chatParticipants');
    private messagesRef = collection(db, 'messages');

    async createChat(type: Chat['type'], participants: string[], name?: string): Promise<string> {
        try {
            // Create chat document
            const chatData: Omit<Chat, 'id'> = {
                type,
                participants,
                name,
                admins: type === 'group' ? [participants[0]] : undefined,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            const chatRef = await addDoc(this.chatsRef, chatData);

            // Create participant records
            const participantPromises = participants.map(userId => {
                const participantData: Omit<ChatParticipant, 'chatId'> = {
                    userId,
                    unreadCount: 0,
                    isMuted: false,
                    isPinned: false,
                    joinedAt: Timestamp.now(),
                    role: type === 'group' && userId === participants[0] ? 'admin' : 'member',
                    settings: {
                        notifications: true,
                        mediaAutoDownload: true
                    }
                };
                return addDoc(this.participantsRef, { 
                    chatId: chatRef.id,
                    ...participantData 
                });
            });

            await Promise.all(participantPromises);
            return chatRef.id;

        } catch (error) {
            console.error('Error creating chat:', error);
            throw error;
        }
    }

    async sendMessage(chatId: string, senderId: string, type: MessageType, content: Message['content'], replyTo?: Message['replyTo']): Promise<string> {
        try {
            const chatRef = doc(this.chatsRef, chatId);
            const chatDoc = await getDoc(chatRef);

            if (!chatDoc.exists()) {
                throw new Error('Chat not found');
            }

            const messageData: Omit<Message, 'id'> = {
                chatId,
                senderId,
                type,
                content,
                replyTo,
                readBy: {
                    [senderId]: {
                        readAt: Timestamp.now(),
                        deliveredAt: Timestamp.now()
                    }
                },
                isForwarded: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            const messageRef = await addDoc(this.messagesRef, messageData);

            // Update chat's last message
            const lastMessage = {
                messageId: messageRef.id,
                text: content.text || 'Media message',
                senderId,
                timestamp: messageData.createdAt,
                type
            };

            await updateDoc(chatRef, {
                lastMessage,
                updatedAt: messageData.createdAt
            });

            // Increment unread count for other participants
            const participantsQuery = query(
                this.participantsRef,
                where('chatId', '==', chatId),
                where('userId', '!=', senderId)
            );

            const participantDocs = await getDocs(participantsQuery);
            const updatePromises = participantDocs.docs.map(doc => 
                updateDoc(doc.ref, {
                    unreadCount: (doc.data().unreadCount || 0) + 1
                })
            );

            await Promise.all(updatePromises);
            return messageRef.id;

        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    async markMessageAsRead(messageId: string, userId: string): Promise<void> {
        try {
            const messageRef = doc(this.messagesRef, messageId);
            const messageDoc = await getDoc(messageRef);

            if (!messageDoc.exists()) {
                throw new Error('Message not found');
            }

            const messageData = messageDoc.data() as Message;
            const readBy = messageData.readBy || {};
            readBy[userId] = {
                readAt: Timestamp.now(),
                deliveredAt: readBy[userId]?.deliveredAt || Timestamp.now()
            };

            await updateDoc(messageRef, { readBy });

            // Reset unread count for the user in this chat
            const participantQuery = query(
                this.participantsRef,
                where('chatId', '==', messageData.chatId),
                where('userId', '==', userId)
            );

            const participantDocs = await getDocs(participantQuery);
            if (!participantDocs.empty) {
                await updateDoc(participantDocs.docs[0].ref, {
                    unreadCount: 0,
                    lastReadMessageId: messageId
                });
            }

        } catch (error) {
            console.error('Error marking message as read:', error);
            throw error;
        }
    }

    async getChatMessages(chatId: string, lastMessageId?: string, pageSize: number = 50): Promise<Message[]> {
        try {
            let messagesQuery = query(
                this.messagesRef,
                where('chatId', '==', chatId),
                orderBy('createdAt', 'desc'),
                limit(pageSize)
            );

            if (lastMessageId) {
                const lastMessageDoc = await getDoc(doc(this.messagesRef, lastMessageId));
                if (lastMessageDoc.exists()) {
                    messagesQuery = query(
                        messagesQuery,
                        startAfter(lastMessageDoc)
                    );
                }
            }

            const messageDocs = await getDocs(messagesQuery);
            return messageDocs.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Message[];

        } catch (error) {
            console.error('Error getting chat messages:', error);
            throw error;
        }
    }

    async getUserChats(userId: string): Promise<Chat[]> {
        try {
            // Get all chat participants for the user
            const participantsQuery = query(this.participantsRef, where('userId', '==', userId));
            const participantDocs = await getDocs(participantsQuery);

            if (participantDocs.empty) {
                return [];
            }

            // Get all chat IDs where the user is a participant
            const chatIds = participantDocs.docs.map(doc => doc.data().chatId);

            // Get all chats for these IDs
            const chatsQuery = query(this.chatsRef, where(documentId(), 'in', chatIds));
            const chatDocs = await getDocs(chatsQuery);

            // Map chat documents to Chat objects
            const chats = await Promise.all(chatDocs.docs.map(async (chatDoc) => {
                const chatData = chatDoc.data();
                
                // Get participant IDs from the chat document
                const participantIds = chatData.participants || [];
                
                const chat: Chat = {
                    id: chatDoc.id,
                    type: chatData.type,
                    name: chatData.name || '',
                    participants: participantIds,
                    admins: chatData.admins,
                    createdAt: chatData.createdAt,
                    updatedAt: chatData.updatedAt,
                    lastMessage: chatData.lastMessage || undefined
                };

                return chat;
            }));

            return chats;
        } catch (error) {
            console.error('Error fetching user chats:', error);
            throw new Error('Failed to fetch user chats');
        }
    }
} 