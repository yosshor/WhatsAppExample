import { useAuth } from '../contexts/AuthContext';
import Constants from 'expo-constants';

const API_URL = __DEV__ 
  ? 'http://10.0.2.2:3000/api'  // Android emulator
  : 'https://your-production-url.com/api'; // Replace with your production URL

export function useApi() {
  const { user } = useAuth();

  const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  };

  return { fetchWithAuth };
} 