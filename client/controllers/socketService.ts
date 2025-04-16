// socketService.ts
import io from 'socket.io-client';
import { Platform } from 'react-native';

// Important: Use the appropriate URL based on your setup
// For Android emulator, use 10.0.2.2 instead of localhost
// For iOS simulator, you can use localhost
// For physical devices, use your computer's IP address on the local network

const SOCKET_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:3000'  // Android emulator special IP for localhost
    : 'http://localhost:3000'; // iOS or web

class SocketService {
    socket: any;

    constructor() {
        this.socket = null;
        this.setupSocketConnection();
    }

    setupSocketConnection() {
        this.socket = io(SOCKET_URL, {
            transports: ['websocket', "polling"],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 10
        });

        this.socket.on('connect', () => {
            console.log('Connected to socket server with ID:', this.socket.id);
        });

        this.socket.on('connect_error', (error:any) => {
            console.error('Socket connection error:', error);
        });

        this.socket.on('disconnect', (reason:any) => {
            console.log('Socket disconnected:', reason);
        });
    }

    joinRoom(roomId: string ) {
        if (this.socket) {
            this.socket.emit('join room', roomId);
            console.log('Joining room:', roomId);
        }
    }

    leaveRoom(roomId:string) {
        if (this.socket) {
            this.socket.emit('leave room', roomId);
            console.log('Leaving room:', roomId);
        }
    }

    sendMessage(message:string, roomId: string | null = null) {
        if (this.socket) {
            this.socket.emit('chat message', { message, roomId });
            console.log('Message sent:', message, 'to room:', roomId);
        }
    }

    subscribeToMessages(callback: (message: string) => void) {
        if (this.socket) {
            this.socket.on('chat message', (message: string) => {
                callback(message);
            });
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
}

export default new SocketService();