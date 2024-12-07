import { ComplaintService } from './complaint.service';
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
  Patch,
} from '@nestjs/common';
import { ComplaintDTO } from './dto/create-complaint.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ConfigService } from '@nestjs/config';
import { UpdateComplaintStatusDto } from './dto/update-complaint.dto';
import { Express } from 'express';
import { Request, Response } from 'express';
import { UserPayload } from 'src/user/interface/token.interface';
import { ResidentGuard } from 'src/auth/guards/resident.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Controller('complaint')
export class ComplaintController {
  private readonly logger = new Logger(ComplaintController.name);
  constructor(
    private complaintService: ComplaintService,
    private configService: ConfigService,
  ) {}

  @Post('')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('complaintImage', {
      storage: diskStorage({
        destination: './uploads/complaint-images',
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
  async Complaint(
    @Body() payload: ComplaintDTO,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file)
      console.log('File must be in Image Format OR NO File is Attached(null)');

    const server = this.configService.get<string>('SERVER_URL');

    const complaintImage = file
      ? `${server}/uploads/complaint-images/${file?.filename}`
      : `${server}/user/pictures/1717104047525_default-image.png`;

    const { complaint, description, complaintType } = payload;
    const { fullName, email, userId } = req.user as UserPayload;
    const data = {
      fullName,
      email,
      complaint,
      complaintType,
      description,
      complaintImage,
      userId,
    };
    this.logger.debug(data);
    await this.complaintService.addUserComplaint(data);
    return 'Complaint Added Will Contact You Soon';
  }

  @Get('/pictures/:filename')
  PictureOne(@Param('filename') filename: string, @Res() res: Response) {
    res.sendFile(filename, { root: './uploads/complaint-images' });
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  async GetByPagination(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('userId') userId?: number,
    @Query('id') id?: string,
    @Query('role') role?: string,
    @Query('complaintType') complaintType?: string,
  ) {
    try {
      const pageNumber = page ? parseInt(page, 10) : undefined;
      const limitNumber = limit ? parseInt(limit, 10) : undefined;

      const skip = limitNumber ? (pageNumber - 1) * limitNumber : undefined;
      const take = limitNumber;

      this.logger.debug(`The User id in controller: ${userId}`);

      const complaintData = await this.complaintService.getComplaint(
        skip,
        take,
        userId,
        id,
        complaintType,
      );
      return {
        data: complaintData.items,
        total: complaintData.total,
        page: pageNumber || 0,
        limit: limitNumber || complaintData.total, // Total items if pagination not applied
      };
    } catch (error) {
      this.logger.error(
        'Error fetching complaints by pagination:',
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch complaints');
    }
  }

  @Patch('/admin/:id')
  @UseGuards(JwtAuthGuard, AdminGuard) // Apply both JWT and Admin Guard
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateComplaintAsAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateComplaintStatusDto: UpdateComplaintStatusDto,
  ) {
    const complaintId = Number(id);
    this.logger.debug(` updatingComplaintAdmin id ${complaintId}`);

    return this.complaintService.updateComplaintAdmin(
      complaintId,
      updateComplaintStatusDto,
    );
  }

  @Put('/resident/:id')
  @UseGuards(JwtAuthGuard, ResidentGuard) // Apply both JWT and Resident Guard
  @UseInterceptors(
    FileInterceptor('complaintImage', {
      storage: diskStorage({
        destination: './uploads/complaint-images',
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
  @UsePipes(new ValidationPipe())
  async updateComplaintAsResident(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateComplaintStatusDto: ComplaintDTO,
    @Req() req: any,
  ): Promise<ComplaintDTO> {
    const userId = req.user.userId;
    const server = this.configService.get<string>('SERVER_URL');
    const existingComplaint = await this.complaintService.getComplaintById(id);
    this.logger.debug(
      `ExistingVisitor Object=>${JSON.stringify(existingComplaint)}`,
    );
    if (!existingComplaint) {
      throw new HttpException('Visitor not found', HttpStatus.NOT_FOUND);
    }

    if (file) {
      const server = this.configService.get<string>('SERVER_URL');
      updateComplaintStatusDto.complaintImage = `${server}/uploads/complaint-images/${file?.filename}`;
      this.logger.debug(
        `updated Complaint Image=> ${JSON.stringify(updateComplaintStatusDto.complaintImage)}`,
      );
    } else {
      updateComplaintStatusDto.complaintImage =
        existingComplaint.complaintImage;
      this.logger.debug(
        `existingComplaint->updated Complaint Image=> ${JSON.stringify(updateComplaintStatusDto.complaintImage)}`,
      );
    }
    this.logger.debug(
      `Updating Complaint with ID: ${id} with Data: ${JSON.stringify(updateComplaintStatusDto)}`,
    );

    return this.complaintService.updateComplaintUser(
      id,
      userId,
      updateComplaintStatusDto,
    );
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteComplaint(@Param('id') id: number): Promise<any> {
    try {
      const response = await this.complaintService.deleteComplaint(id);
      return response;
    } catch (error) {
      console.error('Error deleting complaints:', error);
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
