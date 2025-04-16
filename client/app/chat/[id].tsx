import { StyleSheet, TextInput, TouchableOpacity, FlatList, View, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { chats } from '@/data/chats';
import socketService from '@/controllers/socketService';
import { User } from '@/interfaces/user';

const API_URL = 'http://localhost:3000/api';

interface Message {
    id: string;
    text: string;
    senderId: string;
    receiverId: string;
    timestamp: Date;
    conversationId: string;
    sender?: User;
}

interface Conversation {
    id: string;
    nickname: string;
    participants: string[];
    lastMessage?: string;
    lastMessageTime?: Date;
    participantsData?: (User | null)[];
}

export default function ChatScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [otherUser, setOtherUser] = useState<User | null>(null);
    const currentUserId = 'user1'; // Replace with actual current user ID
    const otherUserId = 'user2'; // Replace with actual other user ID

    useEffect(() => {
        const loadConversation = async () => {
            try {
                // Load conversation details
                const convResponse = await fetch(`${API_URL}/chat/conversation/${id}`);
                const convData = await convResponse.json();
                setConversation(convData);

                // Load messages
                const messagesResponse = await fetch(`${API_URL}/chat/messages/${id}`);
                const messagesData = await messagesResponse.json();
                setMessages(messagesData);
            } catch (error) {
                console.error('Failed to load conversation:', error);
            }
        };

        loadConversation();
        
        // Subscribe to socket messages
        socketService.subscribeToMessages((receivedMessage: string) => {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                text: receivedMessage,
                senderId: otherUserId,
                receiverId: currentUserId,
                timestamp: new Date(),
                conversationId: id as string,
                sender: otherUser
            }]);
        });

        // Join the chat room
        socketService.joinRoom(id as string);

        return () => {
            socketService.leaveRoom(id as string);
        };
    }, [id]);

    const handleSend = async () => {
        if (message.trim()) {
            try {
                const response = await fetch(`${API_URL}/chat/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: message.trim(),
                        senderId: currentUserId,
                        receiverId: otherUserId,
                        conversationId: id
                    })
                });

                if (response.ok) {
                    const newMessage = await response.json();
                    setMessages(prev => [...prev, newMessage]);
                    setMessage('');
                    
                    // Send message through socket
                    socketService.sendMessage(message.trim(), id as string);
                }
            } catch (error) {
                console.error('Failed to send message:', error);
            }
        }
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <ThemedView style={[
            styles.messageContainer,
            item.senderId === currentUserId ? styles.myMessage : styles.theirMessage
        ]}>
            {item.senderId !== currentUserId && item.sender?.profileImage && (
                <Image 
                    source={{ uri: item.sender.profileImage }} 
                    style={styles.profileImage}
                />
            )}
            <View style={styles.messageContent}>
                <ThemedText style={styles.senderName}>
                    {item.sender?.name || (item.senderId === currentUserId ? 'You' : 'Other User')}
                </ThemedText>
                <ThemedText style={styles.messageText}>{item.text}</ThemedText>
                {item.senderId === currentUserId && (
                    <ThemedText style={styles.sign}>✓✓</ThemedText>
                )}
            </View>
        </ThemedView>
    );

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
            />

            <ThemedView style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Type a message..."
                    onSubmitEditing={handleSend}
                />
                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSend}
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
    senderName: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    messageText: {
        fontSize: 16,
    },
    sign: {
        fontSize: 12,
        color: '#8696A0',
        marginTop: 4,
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
    },
    sendButton: {
        backgroundColor: '#128C7E',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        justifyContent: 'center',
    },
    sendButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});