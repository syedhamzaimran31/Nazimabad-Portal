import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  InternalServerErrorException,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AnnouncementService } from './announcement.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { UserPayload } from 'src/user/interface/token.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Express } from 'express';
import { Request, Response } from 'express';

@Controller('announcement')
export class AnnouncementController {
  private readonly logger = new Logger(AnnouncementController.name);
  constructor(
    private readonly announcementService: AnnouncementService,
    private configService: ConfigService,
  ) {}

  //Only for Admins
  @Post('')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(
    FileInterceptor('announcementImage', {
      storage: diskStorage({
        destination: './uploads/announcement-images',
        filename: (req, file, cb) => {
          const newFileName = Date.now() + '_' + file.originalname;
          cb(null, newFileName);
        },
      }),

      fileFilter: (req, file, cb) => {
        if (file && !file?.originalname.match(/\.(jpg|jpeg|png|gif)$/i))
          return cb(null, false); //no file return to handler complaint means file reject here
        return cb(null, true);
      },
    }),
  )
  async Announcement(
    @Body() payload: CreateAnnouncementDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file)
      console.log('File must be in Image Format OR NO File is Attached(null)');

    const server = this.configService.get<string>('SERVER_URL');

    const announcementImage = file
      ? `${server}/uploads/announcement-images/${file?.filename}`
      : `${server}/uploads/announcement-images/1717104047525_default-image.png`;

    const { title, content } = payload;
    const { fullName, email, userId } = req.user as UserPayload;
    const data = {
      fullName,
      email,
      title,
      content,
      announcementImage,
      userId,
    };
    this.logger.debug(data);
    await this.announcementService.createAnnouncement(data);
    return { status: 'Successful', data };
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  async GetByPagination(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: number,
    @Query('id') id?: string,
    @Query('announcementType') announcementType?: string,
  ) {
    try {
      const pageNumber = page ? parseInt(page, 10) : 1;
      const limitNumber = limit ? parseInt(limit, 10) : undefined;

      const skip = limitNumber ? (pageNumber - 1) * limitNumber : undefined;
      const take = limitNumber;

      this.logger.debug(`The User id in controller: ${userId}`);

      const announcementsData = await this.announcementService.getAnnouncements(
        skip,
        take,
        userId,
        id,
        announcementType,
      );
      return {
        data: announcementsData.items,
        total: announcementsData.total,
        page: pageNumber,
        limit: limitNumber || announcementsData.total, // Total items if pagination not applied
      };
    } catch (error) {
      this.logger.error(
        'Error fetching announcements by pagination:',
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch announcements');
    }
  }

  //Only for Admins
  @Put('/:id')
  @UseGuards(JwtAuthGuard, AdminGuard) // Apply both JWT and Admin Guard
  @UsePipes(new ValidationPipe())
  @UseInterceptors(
    FileInterceptor('announcementImage', {
      storage: diskStorage({
        destination: './uploads/announcement-images',
        filename: (req, file, cb) => {
          const newFileName = Date.now() + '_' + file.originalname;
          cb(null, newFileName);
        },
      }),

      fileFilter: (req, file, cb) => {
        if (file && !file?.originalname.match(/\.(jpg|jpeg|png|gif)$/i))
          return cb(null, false); //no file return to handler complaint means file reject here
        return cb(null, true);
      },
    }),
  )
  async updateAnnouncement(
    @Param('id', ParseIntPipe) id: number,
    @Body() UpdateAnnouncementDto: UpdateAnnouncementDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    const userId = req.user.userId;

    if (!file)
      console.log('File must be in Image Format OR NO File is Attached(null)');

    if (file) {
      const server = this.configService.get<string>('SERVER_URL');
      const announcementImage = file
        ? `${server}/uploads/announcement-images/${file?.filename}`
        : `${server}/uploads/announcement-images/1717104047525_default-image.png`;
      UpdateAnnouncementDto.announcementImage = announcementImage;
    }

    this.logger.debug(
      `DTO in Controller: ${JSON.stringify(UpdateAnnouncementDto)}`,
    );

    return this.announcementService.updateAnnouncement(
      id,
      userId,
      UpdateAnnouncementDto,
    );
  }
  @Delete('/:id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deleteAnnouncement(@Param('id') id: number) {
    try {
      await this.announcementService.deleteAnnouncement(id);
      return { status: 'Success' };
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
