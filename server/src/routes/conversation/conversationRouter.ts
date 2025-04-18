import express from 'express';
import { db } from '../../config/firebase';
import { collection, doc, getDoc, query, where, getDocs, addDoc, updateDoc, setDoc } from 'firebase/firestore';

const router = express.Router();

// Get conversation by ID
router.post('/:id', async (req, res) => {
    try {
        console.log('Getting conversation by ID:', req.params.id, req.params);
        console.log('req.body',req.body);
        const conversationRef = doc(db, 'conversations', req.params.id);
        const conversationDoc = await getDoc(conversationRef);

        if (!conversationDoc.exists()) {
            // Create new conversation if it doesn't exist
            const newConversation = {
                id: req.params.id,
                participants: ['user1', 'user2'], // You should get these from auth
                createdAt: new Date(),
                updatedAt: new Date(),
                lastMessage: null,
                currentUserId: 'user1', // Replace with actual user ID from auth
                otherUserId: 'user2' // Replace with actual user ID from auth
            };

            await setDoc(conversationRef, newConversation);
            return res.json(newConversation);
        }

        const conversationData = conversationDoc.data();
        res.json({
            id: conversationDoc.id,
            ...conversationData,
            timestamp: conversationData.timestamp?.toDate(),
            createdAt: conversationData.createdAt?.toDate(),
            updatedAt: conversationData.updatedAt?.toDate()
        });
    } catch (error) {
        console.error('Error getting conversation:', error);
        res.status(500).json({ message: 'Failed to get conversation' });
    }
});

// Get all conversations for a user
router.get('/user/:userId', async (req, res) => {
    try {
        console.log('Getting all conversations for user:', req.params.userId);
        const conversationsRef = collection(db, 'conversations');
        const q = query(conversationsRef, where('participants', 'array-contains', req.params.userId));
        const querySnapshot = await getDocs(q);

        const conversations = [];
        for (const doc of querySnapshot.docs) {
            const data = doc.data();
            conversations.push({
                id: doc.id,
                ...data,
                timestamp: data.timestamp?.toDate(),
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate()
            });
        }

        res.json(conversations);
    } catch (error) {
        console.error('Error getting user conversations:', error);
        res.status(500).json({ message: 'Failed to get conversations' });
    }
});

// Create new conversation
router.post('/', async (req, res) => {
    try {
        const { participants, type = 'private' } = req.body;
        console.log('Creating new conversation:', req.body);

        if (!participants || participants.length < 2) {
            return res.status(400).json({ message: 'At least 2 participants required' });
        }

        const conversationsRef = collection(db, 'conversations');
        const newConversation = {
            participants,
            type,
            createdAt: new Date(),
            updatedAt: new Date(),
            lastMessage: null,
            currentUserId: participants[0],
            otherUserId: participants[1]
        };

        const docRef = await addDoc(conversationsRef, newConversation);
        
        res.status(201).json({
            id: docRef.id,
            ...newConversation
        });
    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ message: 'Failed to create conversation' });
    }
});

// Update conversation
router.patch('/:id', async (req, res) => {
    try {
        const { nickname, lastMessage } = req.body;
        const conversationRef = doc(db, 'conversations', req.params.id);
        const conversationDoc = await getDoc(conversationRef);

        if (!conversationDoc.exists()) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        const updates: any = {
            updatedAt: new Date()
        };
        
        if (nickname !== undefined) updates.nickname = nickname;
        if (lastMessage !== undefined) updates.lastMessage = lastMessage;

        await updateDoc(conversationRef, updates);
        res.json({ message: 'Conversation updated successfully' });
    } catch (error) {
        console.error('Error updating conversation:', error);
        res.status(500).json({ message: 'Failed to update conversation' });
    }
});

export default router;
