import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { GetQueryChatDto } from './dto/get-chats.dto';
import { CreateChatRoomDto } from './dto/create-chat-room.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { ChatRoom } from './entities/chat-room.entity';
import { JoinRoomDto } from './dto/join-room.dto';
import { LeaveRoomDto } from './dto/leave-room.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatsService) {}

  @Get('messages')
  @UseGuards(JwtAuthGuard)
  async getMessagesByChatRoom(@Query() query: GetQueryChatDto) {
    return this.chatService.getMessagesByChatRoom(query);
  }

  @Post('rooms')
  @UseGuards(JwtAuthGuard)
  async createChatRoom(@Body() createChatRoomDto: CreateChatRoomDto) {
    return this.chatService.createChatRoom(createChatRoomDto);
  }

  @Post('join-room')
  @UseGuards(JwtAuthGuard)
  async joinRoom(@Request() req: any, @Body() joinRoomDto: JoinRoomDto) {
    return this.chatService.addParticipantToRoom(req, joinRoomDto);
  }

  @Post('leave-room')
  @UseGuards(JwtAuthGuard)
  async leaveRoom(@Request() req: any, @Body() leaveRoomDto: LeaveRoomDto) {
    return this.chatService.removeParticipantFromRoom(req, leaveRoomDto);
  }

  @Get('rooms')
  @UseGuards(JwtAuthGuard)
  async getChatRooms(@Query() query: GetQueryChatDto): Promise<ChatRoom[]> {
    return this.chatService.getChatRooms(query);
  }

  // @Get('rooms')
  // @UseGuards(JwtAuthGuard)
  // async getChatRoomsByUser(@Query() query: GetQueryChatDto) {
  //   return this.chatService.getChatRoomsByUser(query);
  // }

  @Get('history/user')
  @UseGuards(JwtAuthGuard)
  async getChatHistoryBetweenUsers(
    @Request() req: any,
    @Query() query: GetQueryChatDto,
  ) {
    return this.chatService.getChatHistoryBetweenUsers(req, query);
  }

  // @Get('history/room')
  // @UseGuards(JwtAuthGuard)
  // async getChatHistory(@Query() query: GetQueryChatDto) {
  //   return this.chatService.getChatHistory(query);
  // }
}
