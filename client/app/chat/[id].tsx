import { StyleSheet, TextInput, TouchableOpacity, FlatList, View, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
// import socketService from '../../controllers/socketService';
import { User } from '@/models/user/user';
import Message from '@/models/message/message';
import { Conversation } from '@/models/conversation/conversation';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/hooks/useApi';

const API_URL = 'http://localhost:3000/api';

export default function ChatScreen() {
    const { id, name } = useLocalSearchParams();
    const router = useRouter();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [otherUser, setOtherUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    // const { fetchWithAuth } = useApi();
    // const { user, signIn, logout } = useAuth( );


    // Function to fetch messages
    const fetchAllMessages = async () => {
        try {
            const url = `${API_URL}/chats/${id}/getAllMessages/`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch messages');
            const data = await response.json();
            setMessages(data.messages);
            return data;
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;

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
            const response = await fetch(`${API_URL}/chats/${id}/sendMessage`, {
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
        // const messageTime = item.createdAt instanceof Date 
        //     ? item.createdAt.seconds.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        //     : item.createdAt.seconds.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
                            {item.senderId}
                        </ThemedText>
                    )}
                    <ThemedText style={styles.messageText}>
                        {item.content.text}
                    </ThemedText>
                    <View style={styles.messageFooter}>
                        <ThemedText style={styles.timestamp}>
                            {item.createdAt.seconds.toLocaleString()}
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
    }

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E5DDD5',
        
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#075E54',
        height: 60,
    },
    backButton: {
        padding: 10,
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    headerInfo: {
        flex: 1,
    },
    headerName: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerStatus: {
        color: '#FFFFFF',
        fontSize: 14,
        opacity: 0.8,
    },
    chatList: {
        flex: 1,
    },
    chatContent: {
        padding: 10,
    },
    messageRow: {
        flexDirection: 'row',
        marginVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: '#ffffff',
    },
    myMessageRow: {
        justifyContent: 'flex-end',
    },
    theirMessageRow: {
        justifyContent: 'flex-start',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 8,
        alignSelf: 'center',
        justifyContent: 'center',
    },
    messageContainer: {
        maxWidth: '70%',
        borderRadius: 15,
        padding: 10,
        paddingBottom: 15,
    },
    myMessage: {
        backgroundColor: '#DCF8C6',
        marginLeft: 40,
    },
    theirMessage: {
        backgroundColor: '#FFFFFF',
        marginRight: 40,
    },
    senderName: {
        fontSize: 13,
        color: '#075E54',
        marginBottom: 2,
    },
    messageText: {
        fontSize: 16,
        color: '#000000',
    },
    messageFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        position: 'absolute',
        right: 8,
        bottom: 4,
    },
    timestamp: {
        fontSize: 11,
        color: '#7C8B95',
        marginRight: 3,
    },
    readStatus: {
        fontSize: 11,
        color: '#7C8B95',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#F6F6F6',
        alignItems: 'flex-end',
    },
    input: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 10,
        maxHeight: 100,
        minHeight: 40,
    },
    sendButton: {
        backgroundColor: '#075E54',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 8,
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#B1B1B1',
    },
    sendButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});