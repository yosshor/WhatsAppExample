# WhatsApp Clone with Firestore and Socket.IO

A real-time chat application built with React Native, Expo, Firebase/Firestore, and optional Socket.IO integration.

## 🚀 Features

- Real-time messaging
- Message status (sent/delivered/read)
- User presence (online/offline status)
- Message timestamps
- User avatars
- Chat history
- Message persistence
- Typing indicators

## 🛠 Technology Stack

- **Frontend**:
  - React Native
  - Expo Router
  - TypeScript
  - Native Base (UI Components)

- **Backend**:
  - Firebase/Firestore
  - Optional Socket.IO integration
  - Node.js/Express (for Socket.IO implementation)

## 📦 Firebase/Firestore Setup

### Database Structure

```typescript
// Users Collection
users/{userId}
{
  id: string
  name: string
  email: string
  avatar: string
  status: 'online' | 'offline'
  lastSeen: timestamp
}

// Conversations Collection
conversations/{conversationId}
{
  id: string
  participants: string[]
  lastMessage: {
    text: string
    senderId: string
    timestamp: timestamp
  }
  createdAt: timestamp
  updatedAt: timestamp
}

// Messages Collection
messages/{messageId}
{
  id: string
  conversationId: string
  senderId: string
  content: {
    type: 'text' | 'image' | 'file'
    text?: string
    url?: string
  }
  createdAt: timestamp
  readBy: {
    [userId: string]: timestamp
  }
}
```

### Firebase Configuration

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Add your Firebase configuration:

```typescript
// firebase.config.ts
export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

## 🔌 Socket.IO Integration (Optional)

Socket.IO can be integrated for enhanced real-time features:

### Server Setup

```typescript
// server.ts
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  // Handle user connection
  socket.on('join', (userId) => {
    socket.join(userId);
    // Update user status to online
  });

  // Handle new messages
  socket.on('message', (data) => {
    // Broadcast to conversation participants
    io.to(data.conversationId).emit('new_message', data);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(data.conversationId).emit('user_typing', {
      userId: data.userId,
      conversationId: data.conversationId
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    // Update user status to offline
  });
});

httpServer.listen(3000);
```

### Client Integration

```typescript
// socketio.ts
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

export const initializeSocket = (userId: string) => {
  socket.emit('join', userId);
};

export const sendMessage = (messageData: any) => {
  socket.emit('message', messageData);
};

export const startTyping = (data: { userId: string, conversationId: string }) => {
  socket.emit('typing', data);
};

// Listen for new messages
socket.on('new_message', (message) => {
  // Handle new message
});

// Listen for typing indicators
socket.on('user_typing', (data) => {
  // Show typing indicator
});
```

## 🔒 Security Rules

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Conversations
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null &&
        request.auth.uid in resource.data.participants;
    }
    
    // Messages
    match /messages/{messageId} {
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/conversations/$(resource.data.conversationId))
        .data.participants[request.auth.uid] != null;
    }
  }
}
```

## 📱 Running the Application

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Start the development server:
```bash
npm start
# or
yarn start
```

3. Run on iOS/Android:
```bash
npm run ios
# or
npm run android
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 