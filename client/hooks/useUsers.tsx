//fetch all the users from the database
import { useState, useEffect } from 'react';
import { User } from '../models/user/user';

const API_URL = 'http://localhost:3000/api';

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/users/all`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setUsers(data.users);
            console.log('users', data.users);
        } catch (error) {
            setError(error as string);
        } finally {
            setLoading(false);
        }
    };

    const createTestUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/users/create-test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) throw new Error('Failed to create test users');
            await fetchUsers(); // Refresh users list after creating test users
        } catch (err) {
            console.error('Error creating test users:', err);
            setError(err instanceof Error ? err.message : 'Failed to create test users');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return {
        users,
        loading,
        error,
        refreshUsers: fetchUsers,
        createTestUsers
    };
}



