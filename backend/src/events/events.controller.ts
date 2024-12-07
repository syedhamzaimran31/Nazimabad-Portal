import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  UseGuards,
  Req,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { extname } from 'path';
import { diskStorage } from 'multer';
import {
  AnyFilesInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { FileUploadInterceptor } from 'src/common/decorators/file-upload.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { FileUrlProvider } from 'src/common/providers/file-url.provider';
import { GetQueryEventDto } from './dto/get-events.dto';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private configService: ConfigService,
    private readonly fileUrlProvider: FileUrlProvider, // Inject FileUrlProvider
  ) {}

  @Post('')
  @UseGuards(JwtAuthGuard)
  @FileUploadInterceptor('eventImages', 5, 'event-images') // Use your custom interceptor
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    return await this.eventsService.createEvent(createEventDto, files, req);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getEvents(@Query() getQueryEventDto: GetQueryEventDto) {
    return await this.eventsService.getEvents(getQueryEventDto);
  }

  @Get(':id')
  getEvent(@Param('id') id: string) {
    return this.eventsService.getEvent(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard) // Ensure that the user is authenticated
  @FileUploadInterceptor('eventImages', 5, 'event-images') // Use your custom interceptor
  async updateEvents(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    return await this.eventsService.updateEvents(
      +id,
      updateEventDto,
      files,
      req,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteEvents(@Param('id') id: number) {
    try {
      await this.eventsService.deleteEvents(id);
      return { status: 'Success' };
    } catch (error) {
      console.error('Error deleting event:', error);
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
