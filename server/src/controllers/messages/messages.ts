import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { addDoc } from "firebase/firestore";
import { db } from "../db/firebaseConfig";

// Send a new message
export const sendMessage = async (req: any, res: any) => {
    try {
        const { text, senderId, receiverId, conversationId } = req.body;
        const messagesRef = collection(db, 'messages');
        
        const newMessage = {
            text,
            senderId,
            receiverId,
            conversationId,
            timestamp: new Date()
        };
        
        const docRef = await addDoc(messagesRef, newMessage);
        res.json({ id: docRef.id, ...newMessage });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
    }
};

// Get messages for a conversation
export const getMessages = async (req: any, res: any) => {
    try {
        const { conversationId } = req.params;
        const messagesRef = collection(db, 'messages');
        const q = query(
            messagesRef,
            where('conversationId', '==', conversationId),
            orderBy('timestamp', 'asc')
        );
        
        const snapshot = await getDocs(q);
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};
