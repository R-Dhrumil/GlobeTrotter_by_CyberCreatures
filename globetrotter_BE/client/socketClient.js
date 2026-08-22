import { io } from 'socket.io-client';

const SOCKET_URL =
  (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_WS_URL || process.env?.REACT_APP_WS_URL || process.env?.VITE_WS_URL)) ||
  'http://localhost:5000';

let socket = null;

/**
 * Socket.IO Real-time Client SDK
 */
export const socketClient = {
  /**
   * Connect to WebSocket server
   */
  connect: (token) => {
    const userToken =
      token || (typeof window !== 'undefined' && (localStorage.getItem('token') || sessionStorage.getItem('token')));

    if (!socket || !socket.connected) {
      socket = io(SOCKET_URL, {
        auth: { token: userToken },
        transports: ['websocket', 'polling'],
        reconnection: true,
      });

      socket.on('connect', () => {
        console.log('⚡ [Socket] Connected with ID:', socket.id);
      });

      socket.on('disconnect', (reason) => {
        console.log('⚡ [Socket] Disconnected:', reason);
      });
    }
    return socket;
  },

  /**
   * Join specific room
   */
  joinRoom: (room) => {
    if (socket) {
      socket.emit('join_room', room);
    }
  },

  /**
   * Leave room
   */
  leaveRoom: (room) => {
    if (socket) {
      socket.emit('leave_room', room);
    }
  },

  /**
   * Send chat/event message
   */
  sendMessage: ({ room, message, sender }) => {
    if (socket) {
      socket.emit('send_message', { room, message, sender });
    }
  },

  /**
   * Listen to incoming messages
   */
  onMessage: (callback) => {
    if (socket) {
      socket.on('new_message', callback);
    }
  },

  /**
   * Listen to real-time notification alerts
   */
  onNotification: (callback) => {
    if (socket) {
      socket.on('notification', callback);
    }
  },

  /**
   * Disconnect socket
   */
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  /**
   * Get raw socket instance
   */
  getSocket: () => socket,
};

export default socketClient;
