import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { In, Repository } from 'typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { User } from 'src/typeorm/Entities/User';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { GetQueryChatDto } from './dto/get-chats.dto';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { LeaveRoomDto } from './dto/leave-room.dto';
import { extractUserIdFromToken } from 'src/utils';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async saveMessage(
    client: any,
    // senderId: number,
    createChatDto: CreateChatDto,
  ) {
    // console.log(`Sender ID ${senderId}`);
    
    let parsedDto;
    if (typeof createChatDto === 'string') {
      // If it's a string, parse it
      parsedDto = JSON.parse(createChatDto);
    } else {
      // If it's an object, use it directly
      parsedDto = createChatDto;
    }

    console.log('Payload received:', createChatDto);
    console.log('Checking parsedDto:', parsedDto);

    const { recipientId, message } = parsedDto;

    const senderId = extractUserIdFromToken(this.jwtService, client);

    const sender = await this.userRepository.findOne({
      where: { id: senderId },
    });

    const recipient = await this.userRepository.findOne({
      where: { id: recipientId },
    });

    if (!sender) {
      throw new Error('Sender not found');
    }
    if (!recipient) {
      throw new Error('Recipient not found');
    }

    // Save the message in the database 
    const messageData = this.messageRepository.create({
      sender,
      message,
      recipient: recipient,
      sentAt: new Date(),
      status: 'delivered',
    });

    return this.messageRepository.save(messageData);
  }

  async saveMessageRoom(client: any, createChatDto: CreateChatDto) {
    const { chatRoomId, message } = JSON.parse(createChatDto.toString());

    const senderId = extractUserIdFromToken(this.jwtService, client);

    // Find the full sender object (user)
    const sender = await this.userRepository.findOne({
      where: { id: senderId },
    });

    if (!sender) {
      throw new Error('Invalid sender');
    }

    const chatRoom = await this.chatRoomRepository.findOne({
      where: { id: chatRoomId },
    });

    if (!chatRoom) {
      throw new Error('Invalid chat room ');
    }

    const messageData = this.messageRepository.create({
      chatRoom,
      sender,
      message,
      sentAt: new Date(),
      status: 'delivered',
    });

    return this.messageRepository.save(messageData);
  }

  async getMessagesByChatRoom(query: GetQueryChatDto): Promise<Message[]> {
    const { chatRoomId } = query;

    return this.messageRepository.find({
      where: { chatRoom: { id: chatRoomId } },
      relations: ['sender'],
      order: { sentAt: 'ASC' },
    });
  }

  async createChatRoom(
    CreateChatRoomDto: CreateChatRoomDto,
  ): Promise<ChatRoom> {
    const { participantIds } = CreateChatRoomDto;

    if (!Array.isArray(participantIds) || participantIds.length === 0) {
      throw new Error('Invalid or empty participant IDs');
    }

    // const participants = await this.userRepository.findByIds(participantIds);
    const participants = await this.userRepository.findBy({
      id: In(participantIds),
    });

    if (participants.length !== participantIds.length) {
      throw new Error('Some participants were not found');
    }

    if (!participants.length) {
      throw new Error('Participants not found');
    }

    const chatRoom = this.chatRoomRepository.create({
      participants,
      createdAt: new Date(),
    });

    return this.chatRoomRepository.save(chatRoom);
  }

  async addParticipantToRoom(req: any, joinRoomDto: JoinRoomDto) {
    const { chatRoomId } = joinRoomDto;
    const userId = req.user.userId;
    const userId_ = parseInt(userId, 10);

    const chatRoom = await this.chatRoomRepository.findOne({
      where: { id: chatRoomId },
      relations: ['participants'],
    });

    if (!chatRoom) {
      throw new Error('Chat room not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId_ } });
    if (!user) {
      throw new Error('User not found');
    }

    if (
      !chatRoom.participants.some((participant) => participant.id === user.id)
    ) {
      chatRoom.participants.push(user);
      return this.chatRoomRepository.save(chatRoom);
    }
  }

  async removeParticipantFromRoom(req: any, leaveRoomDto: LeaveRoomDto) {
    const { chatRoomId } = leaveRoomDto;
    const userId = req.user.userId;
    const userId_ = parseInt(userId, 10);

    const chatRoom = await this.chatRoomRepository.findOne({
      where: { id: chatRoomId },
      relations: ['participants'],
    });
    if (!chatRoom) {
      throw new Error('Chat room not found');
    }

    chatRoom.participants = chatRoom.participants.filter(
      (participant) => participant.id !== userId,
    );
    return this.chatRoomRepository.save(chatRoom);
  }

  async getChatRooms(query: GetQueryChatDto): Promise<ChatRoom[]> {
    const { chatRoomId, userId } = query;

    if (chatRoomId) {
      const chatRoom = await this.chatRoomRepository.findOne({
        where: { id: chatRoomId },
        relations: ['participants'],
      });
      if (!chatRoom) {
        throw new Error('Chat room not found');
      }
      return [chatRoom]; // Return as an array to maintain consistency
    }

    if (userId) {
      const userId_ = parseInt(userId, 10);

      if (isNaN(userId_)) {
        throw new Error('Invalid userId');
      }

      return this.chatRoomRepository.find({
        where: {
          participants: {
            id: userId_,
          },
        },
        relations: ['participants'],
      });
    }

    return this.chatRoomRepository.find({
      relations: ['participants'],
    });
  }

  // async getChatRoomsByUser(query: GetQueryChatDto): Promise<ChatRoom[]> {
  //   const { userId } = query;
  //   const userId_ = parseInt(userId, 10);

  //   if (isNaN(userId_)) {
  //     throw new Error('Invalid userId');
  //   }

  //   return this.chatRoomRepository.find({
  //     where: {
  //       participants: {
  //         id: userId_,
  //       },
  //     },
  //     relations: ['participants'],
  //   });
  // }

  async getChatHistoryBetweenUsers(
    req: any,
    query: GetQueryChatDto,
  ): Promise<Message[]> {
    const { otherUserId } = query;
    const userId = req.user.userId;

    const userId_ = parseInt(userId, 10);
    const otherUserId_ = parseInt(otherUserId, 10);

    if (isNaN(userId)) {
      throw new Error('Invalid userId');
    }
    if (isNaN(otherUserId_)) {
      throw new Error('Invalid otherUserId');
    }

    return this.messageRepository.find({
      where: [
        { sender: { id: userId }, recipient: { id: otherUserId_ } },
        { sender: { id: otherUserId_ }, recipient: { id: userId } },
      ],
      relations: ['sender', 'recipient'],
      order: { sentAt: 'ASC' },
    });
  }

  // async getChatHistory(query: GetQueryChatDto): Promise<Message[]> {
  //   const { userId, otherUserId } = query;

  //   const userId_ = parseInt(userId, 10);
  //   const otherUserId_ = parseInt(otherUserId, 10);

  //   if (isNaN(userId_)) {
  //     throw new Error('Invalid userId');
  //   }
  //   if (isNaN(otherUserId_)) {
  //     throw new Error('Invalid otherUserId');
  //   }

  //   const chatRooms = await this.chatRoomRepository.find({
  //     where: [
  //       { participants: { id: userId_ } },
  //       { participants: { id: otherUserId_ } },
  //     ],
  //     relations: ['participants'],
  //   });

  //   const chatRoomIds = chatRooms.map((room) => room.id);

  //   return this.messageRepository.find({
  //     where: { chatRoom: { id: In(chatRoomIds) } },
  //     relations: ['sender'],
  //     order: { sentAt: 'ASC' },
  //   });
  // }

  async updateChatRoom(chatRoomId: string, participants: User[]) {
    const chatRoom = await this.chatRoomRepository.findOne({
      where: { id: chatRoomId },
      relations: ['participants'],
    });

    if (!chatRoom) {
      throw new Error('Chat room not found');
    }

    chatRoom.participants = participants;
    await this.chatRoomRepository.save(chatRoom);
  }
}
