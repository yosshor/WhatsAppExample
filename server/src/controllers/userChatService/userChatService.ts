import { db } from '../../config/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { User, UserChat } from '../../model/user/user';

class UserService {
    private usersRef = collection(db, 'users');
    private userChatsRef = collection(db, 'userChats');

    async getUser(userId: string): Promise<User | null> {
        console.log('userId',userId);
        const userDoc = await getDoc(doc(this.usersRef, userId));
        console.log('userDoc',userDoc);
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

    //get all users
    async getAllUsers(): Promise<User[]> {
        const querySnapshot = await getDocs(this.usersRef);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as User));
    }

    

    async searchUsers(searchQuery: string): Promise<User[]> {
        try {
            let q;
            if (!searchQuery.trim()) {
                // If no search query, return all users
                q = query(this.usersRef);
                console.log('q',q);
            } else {
                // If there's a search query, filter by name
                q = query(
                    this.usersRef,
                    where('name', '>=', searchQuery),
                    where('name', '<=', searchQuery + '\uf8ff')
                );
            }
            
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as User));
        } catch (error) {
            console.error('Error searching users:', error);
            throw error;
        }
    }

    subscribeToUser(userId: string, callback: (user: User) => void) {
        return onSnapshot(doc(this.usersRef, userId), (doc) => {
            if (doc.exists()) {
                callback(doc.data() as User);
            }
        });
    }

    async addTestUsers(): Promise<User[]> {
        console.log('Starting addTestUsers method');
        const testUsers: User[] = [
            {
                id: 'family1',
                name: 'Family Group',
                email: 'family@test.com',
                profileImage: 'https://via.placeholder.com/150',
                status: 'online',
                lastSeen: new Date(),
                phoneNumber: '+1234567890'
            },
            {
                id: 'work1',
                name: 'Work Team',
                email: 'work@test.com',
                profileImage: 'https://via.placeholder.com/150',
                status: 'online',
                lastSeen: new Date(),
                phoneNumber: '+1234567891'
            },
            {
                id: 'mom1',
                name: 'Mom',
                email: 'mom@test.com',
                profileImage: 'https://via.placeholder.com/150',
                status: 'away',
                lastSeen: new Date(),
                phoneNumber: '+1234567892'
            },
            {
                id: 'dad1',
                name: 'Dad',
                email: 'dad@test.com',
                profileImage: 'https://via.placeholder.com/150',
                status: 'offline',
                lastSeen: new Date(),
                phoneNumber: '+1234567893'
            }
        ];

        console.log('About to add users to Firestore:', testUsers);

        // Add each test user to Firestore
        for (const user of testUsers) {
            try {
                console.log(`Attempting to create user ${user.id}`);
                const userRef = doc(this.usersRef, user.id);
                const userData = {
                    ...user,
                    lastSeen: user.lastSeen?.toISOString(),
                    status: user.status || 'offline'
                };
                console.log(`User data to be saved:`, userData);
                await setDoc(userRef, userData);
                console.log(`Successfully created user ${user.id}`);
                
                // Verify the user was created
                const checkUser = await getDoc(userRef);
                if (checkUser.exists()) {
                    console.log(`Verified user ${user.id} exists in Firestore`);
                } else {
                    console.error(`User ${user.id} was not found after creation`);
                }
            } catch (error) {
                console.error(`Failed to create user ${user.id}:`, error);
                throw error;
            }
        }

        return testUsers;
    }
}

export default new UserService(); 