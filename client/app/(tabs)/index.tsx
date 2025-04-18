import { StyleSheet, Image, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useConversations } from '../hooks/useConversations';
import { Conversation } from '../types/conversation';
import { formatDistanceToNow } from 'date-fns';

// actual user ID from authentication
const CURRENT_USER_ID = "YossShor";

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const { conversations, loading, error, refreshConversations } = useConversations(CURRENT_USER_ID);

  const filteredConversations = conversations.filter(chat =>
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderChatItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => router.push({
        pathname: '/chat/[id]',
        params: {
          id: item.id,
          name: item.name || 'Chat',
          type: item.type,
        }
      })}
    >
      <Image 
        source={{ 
          uri: item.groupImage || 'https://via.placeholder.com/50'
        }} 
        style={styles.avatar} 
      />
      <ThemedView style={styles.chatInfo}>
        <ThemedView style={styles.chatHeader}>
          <ThemedText style={styles.name}>{item.name || 'Chat'}</ThemedText>
          <ThemedText style={styles.time}>
            {item.lastMessage?.timestamp ? 
              formatDistanceToNow(new Date(item.lastMessage.timestamp), { addSuffix: true }) : 
              formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.messageContainer}>
          <ThemedText style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage?.content || 'No messages yet'}
          </ThemedText>
          {item.lastMessage && !item.lastMessage.readBy.includes(CURRENT_USER_ID) && (
            <ThemedView style={styles.unreadBadge}>
              <ThemedText style={styles.unreadText}>1</ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#128C7E" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText>Error: {error}</ThemedText>
        <TouchableOpacity onPress={refreshConversations} style={styles.retryButton}>
          <ThemedText style={styles.retryText}>Retry</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>WhatsApp</ThemedText>
        <ThemedView style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowSearch(!showSearch)}
          >
            <ThemedText style={styles.headerButtonText}>Search</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/new-chat')}
          >
            <ThemedText style={styles.headerButtonText}>New Chat</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/menu')}
          >
            <ThemedText style={styles.headerButtonText}>Menu</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={async () => {
                try {
                    const response = await fetch('http://localhost:3000/api/users/create-test', {
                        method: 'POST'
                    });
                    const data = await response.json();
                    console.log('Test users created:', data);
                } catch (error) {
                    console.error('Failed to create test users:', error);
                }
            }}
          >
            <ThemedText style={styles.headerButtonText}>Create Test Users</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {showSearch && (
        <ThemedView style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search chats..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </ThemedView>
      )}

      <FlatList
        data={filteredConversations}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
        refreshing={loading}
        onRefresh={refreshConversations}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#128C7E',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  time: {
    fontSize: 12,
    color: '#666',
  },
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#25D366',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  retryButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#128C7E',
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
  },
});
