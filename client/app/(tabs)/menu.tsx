import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';

export default function MenuScreen() {
  const router = useRouter();

  const menuItems = [
    { title: 'New Group', icon: '👥' },
    { title: 'New Broadcast', icon: '📢' },
    { title: 'Linked Devices', icon: '💻' },
    { title: 'Starred Messages', icon: '⭐' },
    { title: 'Settings', icon: '⚙️' },
  ];

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.headerTitle}>Menu</ThemedText>
      </ThemedView>
      
      {menuItems.map((item, index) => (
        <TouchableOpacity 
          key={index}
          style={styles.menuItem}
          onPress={() => console.log(item.title)}
        >
          <ThemedText style={styles.menuIcon}>{item.icon}</ThemedText>
          <ThemedText style={styles.menuText}>{item.title}</ThemedText>
        </TouchableOpacity>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
  },
}); 