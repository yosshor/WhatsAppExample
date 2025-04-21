import { useApi } from '../hooks/useApi';
import { Chat } from '../models/database';
import { Message } from '../models/database';

export function useChatService() {
  const { fetchWithAuth } = useApi();

  const createChat = async (participants: string[], type: 'individual' | 'group', name?: string): Promise<Chat> => {
    return fetchWithAuth('/chats', {
      method: 'POST',
      body: JSON.stringify({ participants, type, name }),
    });
  };

  const sendMessage = async (chatId: string, content: string, type: string = 'text'): Promise<Message> => {
    return fetchWithAuth(`/chats/${chatId}/sendMessage`, {
      method: 'POST',
      body: JSON.stringify({ content, type }),
    });
  };

  const getChatMessages = async (chatId: string): Promise<Message[]> => {
    return fetchWithAuth(`/chats/${chatId}/getAllMessages`);
  };

  const getUserChats = async (userId: string): Promise<Chat[]> => {
    return fetchWithAuth(`/chats/user/${userId}`);
  };

  const markMessageAsRead = async (chatId: string, messageId: string): Promise<Message> => {
    return fetchWithAuth(`/chats/${chatId}/messages/${messageId}/markAsRead`, {
      method: 'PUT',
    });
  };

  return {
    createChat,
    sendMessage,
    getChatMessages,
    getUserChats,
    markMessageAsRead,
  };
} 