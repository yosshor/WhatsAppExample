import { StyleSheet, TextInput, TouchableOpacity, FlatList, View, Image } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { styles } from './[id]styles';
import { User } from '@/models/user/user';
import Message from '@/models/message/message';
import { Conversation } from '@/models/conversation/conversation';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';
import React from 'react';

const API_URL = 'http://localhost:3000/api';

export default function ChatScreen() {
    const { id, name } = useLocalSearchParams();
    const router = useRouter();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>({
        id: typeof id === 'string' ? id+'2' : Array.isArray(id) ? id[0] : '',
        name: '',
        email: ''
    });
    const [otherUser, setOtherUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    // const { fetchWithAuth } = useApi();
    // const { user, signIn, logout } = useAuth( );


    // Function to fetch messages
    const fetchAllMessages = async () => {
        try {
            const url = `${API_URL}/messages/${id}/getAllMessages/`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch messages');
            const data = await response.json();
            const sortedMessages = data.messages.sort((a: Message, b: Message) => 
                new Date(b.createdAt.seconds * 1000).getTime() - new Date(a.createdAt.seconds * 1000).getTime()
            );
            setMessages(sortedMessages);
            return data;
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        async function loadMessages() {
            try {
                setIsLoading(true);
                await fetchAllMessages(); // Initial fetch
                
                // Set up interval for subsequent fetches
                interval = setInterval(() => {
                    fetchAllMessages();
                }, 2000);
                
            } catch (error) {
                console.error('Failed to load messages:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadMessages();

        // Cleanup function that will be called when component unmounts
        return () => {
            if (interval) {
                clearInterval(interval);
                console.log('Interval cleared'); // For debugging
            }
        };
    }, [id]);

    const handleSend = async () => {
        if (!message.trim()) {
            console.log('Message empty or user not authenticated');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/messages/${id}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    text: message.trim(),
                    senderId: id,
                    timestamp: new Date(),
                    read: false,
                    receiverId: otherUser?.id,
                    content: {
                        type: 'text',
                        chatId: id,
                        text: message.trim(),
                    }
                })
            });
            const data = await response.json();

            if (data.message) {
                setMessages(prev => [...prev, data.message]);
            }
            setMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => {
        const isMyMessage = item.senderId === currentUser?.id;
        
        // Format timestamp into readable date and time
        let messageDateTime = '';
        try {
            if (item.createdAt) {
                if (typeof item.createdAt === 'object' && 'seconds' in item.createdAt) {
                    // Handle Firestore Timestamp
                    const date = new Date(item.createdAt.seconds * 1000);
                    
                    // Check if message is from today
                    const today = new Date();
                    const isToday = date.toDateString() === today.toDateString();
                    
                    if (isToday) {
                        // If message is from today, only show time
                        messageDateTime = date.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit'
                        });
                    } else {
                        // If message is from another day, show date and time
                        messageDateTime = date.toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                    }
                } else if (typeof item.createdAt === 'object') {
                    // Handle Date object
                    const date = new Date(item.createdAt as any);
                    messageDateTime = date.toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                } else {
                    // Handle string timestamp
                    const date = new Date(item.createdAt as string);
                    messageDateTime = date.toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
            }
        } catch (error) {
            console.error('Error formatting message time:', error);
            messageDateTime = '';
        }

        return (
            <ThemedView style={[
                styles.messageRow,
                isMyMessage ? styles.myMessageRow : styles.theirMessageRow
            ]}>
                {!isMyMessage && (
                    <Image
                        source={{ uri: 'https://media.licdn.com/dms/image/v2/C4D03AQEH5EGs0OkeTw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1544222558401?e=2147483647&v=beta&t=kz_VI8EGXDQrzggcH0dtFny5u_6O_CxoaGbxA46NoRg' }}
                        style={styles.avatar}
                    />
                )}
                <View style={[
                    styles.messageContainer,
                    isMyMessage ? styles.myMessage : styles.theirMessage
                ]}>
                    {!isMyMessage && (
                        <ThemedText style={styles.senderName}>
                            {name}
                        </ThemedText>
                    )}
                    <ThemedText style={styles.messageText}>
                        {item.content.text}
                    </ThemedText>
                    <View style={styles.messageFooter}>
                        <ThemedText style={styles.timestamp}>
                            {messageDateTime}
                        </ThemedText>
                        {isMyMessage && (
                            <ThemedText style={styles.readStatus}>
                                {Object.keys(item.readBy || {}).length > 1 ? '✓✓' : '✓'}
                            </ThemedText>
                        )}
                    </View>
                </View>
            </ThemedView>
        );
    };

    if (isLoading) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ThemedText>Loading...</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
                    <ThemedText>←</ThemedText>
                </TouchableOpacity>
                <Image
                    source={{ uri: 'https://media.licdn.com/dms/image/v2/C4D03AQEH5EGs0OkeTw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1544222558401?e=2147483647&v=beta&t=kz_VI8EGXDQrzggcH0dtFny5u_6O_CxoaGbxA46NoRg' }}
                    style={styles.headerAvatar}
                />
                <View style={styles.headerInfo}>
                    <ThemedText style={styles.headerName}>{name}</ThemedText>
                    <ThemedText style={styles.headerStatus}>online</ThemedText>
                </View>
            </View>

            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                style={styles.chatList}
                contentContainerStyle={styles.chatContent}
                inverted
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Type a message..."
                    multiline
                />
                <TouchableOpacity 
                    style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
                    onPress={handleSend}
                    disabled={!message.trim()}
                >
                    <ThemedText style={styles.sendButtonText}>Send</ThemedText>
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

