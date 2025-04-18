import { getAuth } from 'firebase/auth';

export const getAuthToken = async (): Promise<string> => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
        throw new Error('User not authenticated');
    }
    
    return user.getIdToken();
};

export const getCurrentUserId = (): string => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
        throw new Error('User not authenticated');
    }
    
    return user.uid;
}; 