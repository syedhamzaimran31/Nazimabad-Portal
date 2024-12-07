import { UserService } from './user.service';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Patch,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  InternalServerErrorException,
  Req,
} from '@nestjs/common';

import { User } from 'src/typeorm/Entities/User';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfigService } from '@nestjs/config';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {}

  @Post('/signup')
  @UsePipes(new ValidationPipe())
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    try {
      const added = await this.userService.createUser(createUserDto);
      return added;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/')
  @UseGuards(JwtAuthGuard)
  async getUsers(
    @Query('id') id: string,
    @Query('username') fullName: string, // New query parameter
    @Query('isVerified') isVerified: boolean,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    try {
      const pageNumber = page ? parseInt(page, 10) : 1;
      const limitNumber = limit ? parseInt(limit, 10) : undefined;

      const skip = limitNumber ? (pageNumber - 1) * limitNumber : undefined;
      const take = limitNumber;

      const userData = await this.userService.getUsers(
        skip,
        take,
        id,
        isVerified,
        fullName,
      );
      return {
        data: userData.items,
        total: userData.total,
        page: pageNumber,
        limit: limitNumber || userData.total, // Total items if pagination not applied
      };
    } catch (error) {
      this.logger.error('Error fetching user by pagination:', error.stack);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  @Patch('')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: (req, file, cb) => {
          let destinationPath = './uploads/users';
          if (file.fieldname === 'profileImage') {
            destinationPath += '/profile-images';
          } else if (file.fieldname === 'cnicImage') {
            destinationPath += '/cnic-images';
          }
          cb(null, destinationPath);
        },
        filename: (req, file, cb) => {
          const newFileName = Date.now() + '_' + file.originalname;
          cb(null, newFileName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
          return cb(null, false);
        }
        return cb(null, true);
      },
    }),
  )
  @UseGuards(JwtAuthGuard)
  async updateUsers(
    @Query('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: any,
  ) {
    try {
      const userId = Number(req.user.userId); // Extract user ID from the JWT token

      this.logger.debug(`USER ID received: ${userId}`);
      this.logger.debug(`ID received: ${id}`);
      const numericId = Number(id);
      if (isNaN(numericId)) {
        throw new Error('Invalid user ID');
      }

      if (userId !== numericId) {
        throw new HttpException('Unauthorized action', HttpStatus.UNAUTHORIZED);
      }

      this.logger.debug(`Converted ID: ${numericId}`);
      this.logger.debug(`Incoming CNIC value: ${updateUserDto.cnic}`);

      files.map((file) => {
        this.logger.debug(`Processing file: ${JSON.stringify(file)}`);
        if (file.fieldname === 'profileImage') {
          updateUserDto.profileImage = `${this.configService.get<string>(
            'SERVER_URL',
          )}/uploads/users/profile-images/${file.filename}`;
        } else if (file.fieldname === 'cnicImage') {
          updateUserDto.cnicImage = `${this.configService.get<string>(
            'SERVER_URL',
          )}/uploads/users/cnic-images/${file.filename}`;
        }
      });

      this.logger.debug(`Updated User DTO: ${JSON.stringify(updateUserDto)}`);

      const updateUser = await this.userService.updateUser(
        numericId,
        updateUserDto,
      );
      return updateUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
