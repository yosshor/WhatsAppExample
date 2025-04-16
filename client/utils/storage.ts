import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAT_STORAGE_KEY = '@chat_messages_';

export const saveChatMessages = async (chatId: string, messages: any[]) => {
  try {
    await AsyncStorage.setItem(CHAT_STORAGE_KEY + chatId, JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving messages:', error);
  }
};

export const loadChatMessages = async (chatId: string) => {
  try {
    const messages = await AsyncStorage.getItem(CHAT_STORAGE_KEY + chatId);
    return messages ? JSON.parse(messages) : [];
  } catch (error) {
    console.error('Error loading messages:', error);
    return [];
  }
}; 