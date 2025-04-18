import express from 'express';
import { db } from '../../config/firebase';
import { collection, query, where, getDocs, addDoc, orderBy, doc, updateDoc } from 'firebase/firestore';

const router = express.Router();

// Get messages for a conversation
router.get('/:conversationId', async (req, res) => {
    try {
        const messagesRef = collection(db, 'conversations', req.params.conversationId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));
        const querySnapshot = await getDocs(q);

        const messages = [];
        for (const doc of querySnapshot.docs) {
            const data = doc.data();
            messages.push({
                id: doc.id,
                ...data,
                timestamp: data.timestamp.toDate()
            });
        }

        res.json(messages);
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ message: 'Failed to get messages' });
    }
});

// Send a new message
router.post('/', async (req, res) => {
    try {
        const { text, conversationId, senderId, receiverId } = req.body;

        if (!text || !conversationId || !senderId || !receiverId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Add message to the conversation's messages subcollection
        const messagesRef = collection(db, 'conversations', conversationId, 'messages');
        const newMessage = {
            text,
            senderId,
            receiverId,
            timestamp: new Date(),
            read: false
        };

        const messageDoc = await addDoc(messagesRef, newMessage);

        // Update conversation's last message
        const conversationRef = doc(db, 'conversations', conversationId);
        await updateDoc(conversationRef, {
            lastMessage: text,
            lastMessageTime: new Date(),
            updatedAt: new Date()
        });

        res.status(201).json({
            id: messageDoc.id,
            ...newMessage,
            conversationId
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
});

// Mark message as read
router.patch('/:messageId/read', async (req, res) => {
    try {
        const { conversationId } = req.body;
        if (!conversationId) {
            return res.status(400).json({ message: 'Conversation ID is required' });
        }

        const messageRef = doc(db, 'conversations', conversationId, 'messages', req.params.messageId);
        await updateDoc(messageRef, {
            read: true
        });

        res.json({ message: 'Message marked as read' });
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({ message: 'Failed to mark message as read' });
    }
});

export default router; 