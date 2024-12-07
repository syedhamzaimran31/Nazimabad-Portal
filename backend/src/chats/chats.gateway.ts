import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UserService } from 'src/user/user.service';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { GetQueryChatDto } from './dto/get-chats.dto';
import { Request } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { extractUserIdFromToken } from 'src/utils';

@WebSocketGateway({ namespace: '/chat', cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private chatService: ChatsService,
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  private connectedUsers = new Map<number, string>(); // userId => socketId mapping

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    const userId = Number(extractUserIdFromToken(this.jwtService, client));

    // const userId = client.handshake.query.userId;
    if (!userId || Array.isArray(userId) || isNaN(userId)) {
      console.log('Unauthorized client, disconnecting...');
      client.disconnect();
      return; // Handle case where userId is missing or is an array
    }

    this.connectedUsers.set(userId, client.id);
    console.log(`User ${userId} connected with socket id ${client.id}`);

    const updateUserStatusDto = new UpdateUserStatusDto();
    updateUserStatusDto.userId = userId;
    updateUserStatusDto.clientId = client.id;
    updateUserStatusDto.status = 'online';

    await this.usersService.updateUserStatus(updateUserStatusDto); // Use DTO
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    const userId = Number(extractUserIdFromToken(this.jwtService, client));
    // const userId = client.handshake.query.userId;
    if (!userId || Array.isArray(userId) || isNaN(userId)) {
      return; // Handle case where userId is missing or is an array
    }

    this.connectedUsers.delete(userId);
    console.log(`User ${userId} disconnected`);

    const updateUserStatusDto = new UpdateUserStatusDto();
    updateUserStatusDto.userId = userId;
    updateUserStatusDto.clientId = client.id;
    updateUserStatusDto.status = 'offline';

    await this.usersService.updateUserStatus(updateUserStatusDto); // Use DTO
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() createMessageDto: CreateChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // const senderId = [...this.connectedUsers].find(
      //   ([_, socketId]) => socketId === client.id,
      // )?.[0];

      // if (!senderId) throw new Error('User not connected');

      let parsedDto;
      if (typeof createMessageDto === 'string') {
        // If it's a string, parse it
        parsedDto = JSON.parse(createMessageDto);
      } else {
        // If it's an object, use it directly
        parsedDto = createMessageDto;
      }

      // Save message to the database
      const message = await this.chatService.saveMessage(
        client,
        createMessageDto,
      );

      const recipientId = Number(parsedDto.recipientId);
      // Find the recipient's socket ID using their userId
      const recipientSocketId = this.connectedUsers.get(
        recipientId,
        // createMessageDto.recipientId,
        // parsedDto.recipientId,
      );

      console.log('Connected Users Map:', this.connectedUsers);
      console.log(
        'Parsed Recipient ID:',
        recipientId,
        'Socket ID:',
        recipientSocketId,
      );

      if (recipientSocketId) {
        // Emit message to the recipient if they are connected
        this.server.to(recipientSocketId).emit('receiveMessage', message);
        this.server.to(recipientSocketId).emit('messageSent', message);
      } else {
        // Handle case where the recipient is not online (optional
        this.server.to(recipientSocketId).emit('receiveMessage', message);
        console.log('Recipient is not online');
      }

      // Optionally, send message back to the sender's client for confirmation
      client.emit('messageSent', message);
    } catch (error) {
      console.error('Error sending message:', error);
      client.emit('error', 'Unable to send message'); // Notify client of error
    }
  }

  @SubscribeMessage('sendMessageRoom')
  async handleMessageRoom(
    @MessageBody() createMessageDto: CreateChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const message = await this.chatService.saveMessageRoom(
        client,
        createMessageDto,
      );
      this.server
        .to(createMessageDto.chatRoomId)
        .emit('receiveMessage', message);
    } catch (error) {
      console.error('Error sending message:', error);
      client.emit('error', 'Unable to send message'); // Notify client of error
    }
  }

  @SubscribeMessage('userTyping')
  handleUserTyping(
    @MessageBody() chatRoomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(chatRoomId).emit('userTyping', client.id);
  }

  // getRoomParticipants(chatRoomId: string): string[] {
  //   const clients = this.server.sockets.adapter.rooms.get(chatRoomId);
  //   return clients ? Array.from(clients) : []; // Return array of user IDs in the room
  // }

  // getRoomMessages(chatRoomId: string): any[] {
  //   // Assuming you have a separate service for storing messages
  //   // Implement logic to fetch messages for the given chat room
  //   return []; // Return array of messages for the room
  // }

  // Implement other chat-related methods (e.g., getChatHistory, handleUserTyping, etc.) as needed
}
