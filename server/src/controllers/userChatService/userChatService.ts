import { db } from '../db/firebaseConfig';
import { collection, doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { User, UserChat } from '../../model/user/user';

class UserService {
    private usersRef = collection(db, 'users');
    private userChatsRef = collection(db, 'userChats');

    async getUser(userId: string): Promise<User | null> {
        const userDoc = await getDoc(doc(this.usersRef, userId));
        return userDoc.exists() ? userDoc.data() as User : null;
    }

    async createUser(user: User): Promise<void> {
        await setDoc(doc(this.usersRef, user.id), user);
    }

    async updateUser(userId: string, updates: Partial<User>): Promise<void> {
        await updateDoc(doc(this.usersRef, userId), updates);
    }

    async getUserChat(userId: string, conversationId: string): Promise<UserChat | null> {
        const chatDoc = await getDoc(doc(this.userChatsRef, `${userId}_${conversationId}`));
        return chatDoc.exists() ? chatDoc.data() as UserChat : null;
    }

    async updateUserChat(userId: string, conversationId: string, updates: Partial<UserChat>): Promise<void> {
        await setDoc(
            doc(this.userChatsRef, `${userId}_${conversationId}`),
            { userId, conversationId, ...updates },
            { merge: true }
        );
    }

    subscribeToUser(userId: string, callback: (user: User) => void) {
        return onSnapshot(doc(this.usersRef, userId), (doc) => {
            if (doc.exists()) {
                callback(doc.data() as User);
            }
        });
    }
}

export default new UserService(); 