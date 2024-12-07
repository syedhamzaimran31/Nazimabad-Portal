// src/services/SocketService.ts
import { ChatEvents, ChatResponse } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/config/axios-instance';
import { io, Socket } from 'socket.io-client';
import tokenService from './token.service';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const chatService = () => {
  const useFetchAllChatBetweenUsers = (otherUserID: number) => {
    async function fetchChats(): Promise<ChatResponse> {
      const response = await axios.get(`/chat/history/user?otherUserId=${otherUserID}`);
      console.log('Fetched Chat data in service:', response.data);
      return response.data;
    }
    return useQuery({
      queryFn: fetchChats,
      queryKey: ['chat'],
    });
  };

  return {
    useFetchAllChatBetweenUsers,
  };
};

export class SocketService {
  private static instance: SocketService;
  private socket: Socket<ChatEvents> | null = null;

  private constructor() {}

  public static getInstance() {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }
  // Initialize and connect to the WebSocket server
  public isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }
  public getSocket() {
    return this.socket;
  }
  public connect() {
    const token = tokenService.getLocalAccessToken();
    console.log('Attempting to connect to the socket...');
    if (!this.socket) {
      console.log(token);
      this.socket = io(`${BASE_URL}/chat`, {
        auth: {
          token: `Bearer ${token}`,
          reconnection: true,
          reconnectionAttempts: 5, // Number of attempts before failing
          reconnectionDelay: 1000, // Delay between attempts
        },
      });

      this.socket.on('connect', () => {
        console.log('Socket connected');
        // Optionally, trigger an external update for isConnected
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
        // Optionally, trigger an external update for isConnected
      });

      // Add event listeners for receiving messages
      this.socket.on('receiveMessage', (message) => {
        console.log('New message received:', message);
        // Handle receiving the message (e.g., update UI)
      });

      this.socket.on('messageSent', (message) => {
        console.log('New message received:', message);
        // Handle receiving the message (e.g., update UI)
      });

      this.socket.on('sendMessage', (message) => {
        console.log('Message successfully sent:', message);
      });

      this.socket.on('error', (error: Error): void => {
        console.error('Error occurred:', error);
      });
    }
  }

  // Emit a message through the socket
  public sendMessage(recipientId: number, message: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('sendMessage', {
        recipientId,
        message,
      });
    } else {
      console.error('Socket not connected');
    }
  }

  // Disconnect the socket
  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
