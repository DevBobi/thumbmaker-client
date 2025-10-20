import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    console.log('🔌 Connecting to WebSocket:', apiUrl);
    
    socketRef.current = io(apiUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    socketRef.current.on('connect', () => {
      console.log('🔌 WebSocket connected:', socketRef.current?.id);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('🔌 WebSocket disconnected:', reason);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error);
    });

    return () => {
      if (socketRef.current) {
        console.log('🔌 Disconnecting WebSocket');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return socketRef.current;
};
