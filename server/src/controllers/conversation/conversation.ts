import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";


// Get conversation details
export const getConversation = async (req: any, res: any) => {
    try {
        const { conversationId } = req.params;
        console.log("conversationId", conversationId);
        const conversationRef = collection(db, 'conversations');
        const q = query(conversationRef, where('id', '==', conversationId));
        
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        
        const conversation = snapshot.docs[0].data();
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch conversation' });
    }
};
