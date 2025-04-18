// socketService.ts
import io from 'socket.io-client';


class SocketService {
    socket: any;
    platform: string;
    socketUrl: string;

    constructor(platform: string) {
        this.socket = null;
        this.platform = platform;
        this.socketUrl = this.platform === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
        this.setupSocketConnection();
    }

    setupSocketConnection() {
        this.socket = io(this.socketUrl, {
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

export default new SocketService('android');