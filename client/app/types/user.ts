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

export default User; 