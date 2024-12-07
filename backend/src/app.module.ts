import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './typeorm/Entities/User';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { Complaint } from './typeorm/Entities/Complaint';
import { VisitorsModule } from './visitors/visitors.module';
import { Visitors } from './typeorm/Entities/visitor.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ComplaintModule } from './complaint/complaint.module';
import { AnnouncementModule } from './announcement/announcement.module';
import { Announcement } from './announcement/entities/announcement.entity';
import { EventsModule } from './events/events.module';
import { Event } from './events/entities/event.entity';
import { FileUrlProvider } from './common/providers/file-url.provider';
import { ChatsModule } from './chats/chats.module';
import { Message } from './chats/entities/message.entity';
import { ChatRoom } from './chats/entities/chat-room.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USERNAME'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        entities: [
          User,
          Complaint,
          Visitors,
          Announcement,
          Event,
          ChatRoom,
          Message,
        ],
        synchronize: true,
        logging: true,
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true, // Makes the ConfigModule globally available
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    UserModule,
    AuthModule,
    VisitorsModule,
    ComplaintModule,
    AnnouncementModule,
    EventsModule,
    ChatsModule,
  ],
  controllers: [AppController],
  providers: [AppService, FileUrlProvider],
})
export class AppModule {
  constructor() {
    console.log('Entities loaded:', [
      User,
      Complaint,
      Visitors,
      Announcement,
      Event,
      ChatRoom,
      Message,
    ]);
  }
}
