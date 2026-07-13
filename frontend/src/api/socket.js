import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (this.socket && this.socket.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinConversation(conversationId) {
    if (this.socket) {
      this.socket.emit('join-conversation', conversationId);
    }
  }

  sendMessage(payload) {
    if (this.socket) {
      this.socket.emit('send-message', payload);
    }
  }

  emitTyping(conversationId) {
    if (this.socket) {
      this.socket.emit('typing', { conversationId });
    }
  }

  markRead(conversationId, messageIds) {
    if (this.socket) {
      this.socket.emit('mark-read', { conversationId, messageIds });
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }
  
  onMessagesRead(callback) {
    if (this.socket) {
      this.socket.on('messages-read', callback);
    }
  }
  
  removeListener(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export const socketService = new SocketService();
