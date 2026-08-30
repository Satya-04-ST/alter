import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket && typeof window !== 'undefined') {
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('⚡ Socket.IO client connected:', socket?.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection warning:', err.message);
    });
  }
  return socket!;
};
