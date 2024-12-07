// // src/services/socketService.ts
// import { io, Socket } from 'socket.io-client';

// class SocketService {
//   private socket: Socket | null = null;

//   connect(token: string) {
//     // Initialize the connection to the WebSocket server
//     this.socket = io('http://localhost:3000', {
//       auth: {
//         token,
//       },
//     });

//     // Handle connection events
//     this.socket.on('connect', () => {
//       console.log('Connected to WebSocket server');
//     });

//     this.socket.on('disconnect', () => {
//       console.log('Disconnected from WebSocket server');
//     });
//   }

//   sendMessage(roomId: string, message: string) {
//     if (this.socket) {
//       this.socket.emit('sendMessage', { roomId, message });
//     }
//   }

//   onMessageReceived(callback: (message: any) => void) {
//     if (this.socket) {
//       this.socket.on('receiveMessage', (message) => {
//         callback(message);
//       });
//     }
//   }

//   disconnect() {
//     if (this.socket) {
//       this.socket.disconnect();
//     }
//   }
// }

// export default new SocketService();
