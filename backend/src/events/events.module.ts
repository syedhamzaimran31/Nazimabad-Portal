import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event } from './entities/event.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileUrlProvider } from 'src/common/providers/file-url.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Event]), AuthModule, ConfigModule],
  controllers: [EventsController],
  providers: [EventsService, ConfigService, FileUrlProvider],
})
export class EventsModule {}
