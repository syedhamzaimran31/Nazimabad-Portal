import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatGateway } from './chats.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { ChatRoom } from './entities/chat-room.entity';
import { User } from 'src/typeorm/Entities/User';
import { ComplaintModule } from 'src/complaint/complaint.module';
import { UserModule } from 'src/user/user.module';
import { ChatController } from './chats.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, ChatRoom, User]), // Register entities
    ComplaintModule,
    UserModule,
    AuthModule,
  ],
  controllers: [ChatController],
  providers: [ChatGateway, ChatsService, ChatController],
})
export class ChatsModule {}
