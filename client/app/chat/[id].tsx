import { StyleSheet, TextInput, TouchableOpacity, FlatList, View, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
// import socketService from '../../controllers/socketService';
import { User } from '@/models/user/user';
import Message from '@/models/message/message';
import { Conversation } from '@/models/conversation/conversation';

const API_URL = 'http://localhost:3000/api';

export default function ChatScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [otherUser, setOtherUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Function to fetch messages
    const fetchMessages = async () => {
        try {
            const url = `${API_URL}/messages/${id}`;
            console.log('url',url);
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch messages');
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    useEffect(() => {
        const loadChatData = async () => {
            try {
                // Load conversation details
                const url = `${API_URL}/conversations/${id}`;
                const urlMessages = `${API_URL}/messages/${id}`;
                console.log('url',url);
                console.log('urlMessages',urlMessages);
                const [convResponse, messagesResponse] = await Promise.all([
                    fetch(url,{
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            id: id,
                            currentUserId: currentUser?.id,
                            otherUserId: otherUser?.id,
                            conversationId: id,
                            messages: messages,
                            conversation: conversation
                        })
                    }),
                    fetch(urlMessages)
                ]);
                console.log('convResponse',convResponse);
                console.log('messagesResponse',messagesResponse);

                if (!convResponse.ok || !messagesResponse.ok) {
                    throw new Error('Failed to load chat data');
                }

                const [convData, messagesData] = await Promise.all([
                    convResponse.json(),
                    messagesResponse.json()
                ]);

                setConversation(convData);
                setMessages(messagesData);

                // Load users
                const urlUsers = `${API_URL}/users/${convData.currentUserId}`;
                const urlUsers2 = `${API_URL}/users/${convData.otherUserId}`;
                console.log('urlUsers',urlUsers);
                console.log('urlUsers2',urlUsers2);
                const [currentUserResponse, otherUserResponse] = await Promise.all([
                    fetch(urlUsers),
                    fetch(urlUsers2)
                ]);

                if (!currentUserResponse.ok || !otherUserResponse.ok) {
                    throw new Error('Failed to load users');
                }

                const [currentUserData, otherUserData] = await Promise.all([
                    currentUserResponse.json(),
                    otherUserResponse.json()
                ]);

                setCurrentUser(currentUserData);
                setOtherUser(otherUserData);

                // Set up polling for new messages
                const pollInterval = setInterval(fetchMessages, 3000);

                return () => clearInterval(pollInterval);
            } catch (error) {
                console.error('Failed to load chat data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadChatData();
    }, [id]);

    const handleSend = async () => {
        if (!message.trim() || !currentUser || !conversation) return;

        try {
            const response = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: message.trim(),
                    conversationId: id,
                    senderId: currentUser.id,
                    receiverId: otherUser?.id
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const newMessage = await response.json();
            setMessages(prev => [...prev, newMessage]);
            setMessage('');

            // Fetch updated messages after sending
            fetchMessages();
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <ThemedView style={[
            styles.messageContainer,
            item.senderId === currentUser?.id ? styles.myMessage : styles.theirMessage
        ]}>
            {item.senderId !== currentUser?.id && item.sender?.profileImage && (
                <Image 
                    source={{ uri: item.sender.profileImage }} 
                    style={styles.profileImage}
                />
            )}
            <View style={styles.messageContent}>
                <ThemedText style={styles.messageText}>{item.text}</ThemedText>
                <ThemedText style={styles.timestamp}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </ThemedText>
                {item.senderId === currentUser?.id && (
                    <ThemedText style={styles.sign}>
                        {item.read ? '✓✓' : '✓'}
                    </ThemedText>
                )}
            </View>
        </ThemedView>
    );

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
                {otherUser?.profileImage && (
                    <Image 
                        source={{ uri: otherUser.profileImage }} 
                        style={styles.headerProfileImage}
                    />
                )}
                <View style={styles.headerInfo}>
                    <ThemedText style={styles.headerTitle}>
                        {conversation?.nickname || otherUser?.name || 'Chat'}
                    </ThemedText>
                    <ThemedText style={styles.headerStatus}>
                        {otherUser?.status || 'offline'}
                    </ThemedText>
                </View>
            </View>

            <FlatList
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                style={styles.messagesList}
                inverted={false}
            />

            <ThemedView style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Type a message..."
                    onSubmitEditing={handleSend}
                    multiline
                />
                <TouchableOpacity
                    style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
                    onPress={handleSend}
                    disabled={!message.trim()}
                >
                    <ThemedText style={styles.sendButtonText}>Send</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerProfileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerStatus: {
        fontSize: 12,
        color: '#666',
    },
    messagesList: {
        flex: 1,
        padding: 16,
    },
    messageContainer: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 16,
        marginBottom: 8,
        maxWidth: '80%',
    },
    myMessage: {
        backgroundColor: '#DCF8C6',
        alignSelf: 'flex-end',
    },
    theirMessage: {
        backgroundColor: '#E8E8E8',
        alignSelf: 'flex-start',
    },
    profileImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 8,
    },
    messageContent: {
        flex: 1,
    },
    messageText: {
        fontSize: 16,
    },
    timestamp: {
        fontSize: 10,
        color: '#8696A0',
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    sign: {
        fontSize: 12,
        color: '#8696A0',
        marginTop: 2,
        alignSelf: 'flex-end',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    input: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: '#128C7E',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#cccccc',
    },
    sendButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});