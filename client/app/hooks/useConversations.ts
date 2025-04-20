import { useState, useEffect } from 'react';
import { User } from '../types/user';
import { Conversation } from '../types/conversation';

const API_URL = 'http://localhost:3000/api'; // Update with your server URL

const useConversations = (userId: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/conversations/${userId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (participants: string[], type: 'private' | 'group' = 'private', name?: string) => {
    try {
      const response = await fetch(`${API_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participants, type, name }),
      });
      if (!response.ok) throw new Error('Failed to create conversation');
      const data = await response.json();
      await fetchConversations(); // Refresh conversations list
      return data.conversationId;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create conversation');
    }
  };

  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  return {
    conversations,
    loading,
    error,
    refreshConversations: fetchConversations,
    createConversation,
  };
};

export default useConversations; 