import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  HttpException,
  HttpStatus,
  ValidationPipe,
  Get,
  Param,
  Patch,
  Delete,
  Query,
  Req,
  Logger,
  BadRequestException,
  Put,
} from '@nestjs/common';
import { VisitorsService } from './visitors.service';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import {
  AnyFilesInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ConfigService } from '@nestjs/config';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { isDate } from 'moment';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@Controller('visitors')
export class VisitorsController {
  private readonly logger = new Logger(VisitorsController.name);
  constructor(
    private readonly visitorsService: VisitorsService,
    private configService: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './uploads/cnic-images',
        filename: (req, file, cb) => {
          const newFileName = Date.now() + '_' + file.originalname;
          cb(null, newFileName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
          return cb(null, false); // reject file
        }
        return cb(null, true);
      },
    }),
  )
  async createVisitor(
    @Body(new ValidationPipe())
    createVisitorDto: CreateVisitorDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: any,
  ): Promise<any> {
    this.logger.debug(`Request ${JSON.stringify(req.user)}`);
    if (!files || files.length === 0) {
      throw new HttpException(
        'File must be an Image Format or No File is Attached',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      console.log('Request User:', req.user); // Debugging line
      const userId = req.user.userId;
      console.log(userId);
      const server = this.configService.get<string>('SERVER_URL');

      const cnicImageUrls = files.map((file) =>
        file
          ? `${server}/uploads/cnic-images/${file.filename}`
          : `${server}/user/pictures/1717104047525_default-image.png`,
      );

      const visitorData = {
        ...createVisitorDto,
        persons: createVisitorDto.persons.map((person, index) => ({
          ...person,
          cnic: person.cnic.replace(/-/g, ''),
          cnicImage: cnicImageUrls[index] || null,
        })),
      };

      console.log(visitorData);
      const createdVisitor = await this.visitorsService.createVisitor(
        visitorData,
        userId,
      );
      return createdVisitor;
    } catch (error) {
      console.error('Error creating visitor:', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('verify')
  // @UseGuards(JwtAuthGuard)
  async verifyVisitors(@Body('qrCode') qrCode: string): Promise<any> {
    const visitor = await this.visitorsService.verifyQrCode(qrCode);

    if (!visitor) {
      throw new HttpException('QrCode is Invalid', HttpStatus.BAD_REQUEST);
    }
    return {
      message: 'Visitor verified successfully',
      status: 'verified',
      visitor,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getVisitors(
    @Query('role') role: string,
    @Query('page') page?: string, // Default to page 1 if not provided
    @Query('limit') limit?: string, // Default to limit 10 if not provided
    @Query('userId') userId?: number,
    @Query('verified') verified?: string,
    @Query('id') id?: string,
    @Query('visitDate') visitDate?: string,
    @Query('checkinTime') checkinTime?: string,
    @Query('checkinTimeEnd') checkinTimeEnd?: string,
    @Query('checkoutTime') checkoutTime?: string,
    @Query('checkoutTimeEnd') checkoutTimeEnd?: string,
    @Param('endpoint') endpoint?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : undefined;
    const limitNumber = limit ? parseInt(limit, 10) : undefined;

    if ((pageNumber && isNaN(pageNumber)) || pageNumber <= 0) {
      throw new BadRequestException('Invalid page number');
    }

    if ((limitNumber && isNaN(limitNumber)) || limitNumber <= 0) {
      throw new BadRequestException('Invalid limit');
    }

    // Only apply pagination if page and limit are provided
    const skip =
      pageNumber && limitNumber ? (pageNumber - 1) * limitNumber : undefined;
    const take = limitNumber;
    // Convert the 'verified' query parameter to a boolean if it's provided
    const isVerified = verified === 'true';

    const { items, total } = await this.visitorsService.getVisitors(
      skip,
      take,
      id,
      role,
      userId,
      visitDate,
      isVerified,
      checkinTime,
      checkinTimeEnd,
      checkoutTime,
      checkoutTimeEnd,
    );

    return {
      data: items,
      total,
      page: pageNumber || 0,
      limit: limitNumber || total,
    };
  }

  @Put('')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: './uploads/cnic-images',
        filename: (req, file, cb) => {
          const newFileName = Date.now() + '_' + file.originalname;
          cb(null, newFileName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        return cb(null, true);
      },
    }),
  )
  async updateVisitor(
    @Query('id') id: number,
    @Body(new ValidationPipe()) updateVisitorDto: UpdateVisitorDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: any,
  ): Promise<any> {
    this.logger.debug(`ID in Controller ${id}`);
    this.logger.debug(`Request ${JSON.stringify(req.user)}`);
    try {
      const userId = req.user.userId;
      const existingVisitor = await this.visitorsService.getVisitorById(id);
      this.logger.debug(
        `ExistingVisitor Object=>${JSON.stringify(existingVisitor)}`,
      );
      if (!existingVisitor) {
        throw new HttpException('Visitor not found', HttpStatus.NOT_FOUND);
      }

      const server = this.configService.get<string>('SERVER_URL');

      const fileMap: Record<string, Express.Multer.File> = {};
      files.forEach((file) => {
        // Example format of fieldname: persons[0][cnicImage]
        const match = file.fieldname.match(/persons\[(\d+)\]\[cnicImage\]/);
        if (match) {
          const index = match[1]; // Extract the person's index
          fileMap[index] = file; // Associate the file with the corresponding person
        }
      });
      // Map through the persons and check for existing or new files
      const updatedPersons = updateVisitorDto.persons.map((person, index) => {
        // Check if there's a file for this index
        // const file = files[index];
        const existingPerson = existingVisitor.persons[index]; // Get the existing person

        const file = fileMap[index];

        // If a new file is uploaded for the person, use it. Otherwise, keep the existing CNIC image.
        return {
          ...existingPerson, // Preserve the existing person data
          ...person, // Overwrite with the updated person data
          cnic: person.cnic.replace(/-/g, ''), // Format CNIC
          cnicImage: file
            ? `${server}/uploads/cnic-images/${file.filename}` // If a new file exists, update the cnicImage
            : existingPerson?.cnicImage || null, // Otherwise, retain the existing cnicImage
        };
      });

      const updatedVisitorData = {
        ...updateVisitorDto,
        persons: updatedPersons,
      };

      this.logger.debug(
        `Updated Visitor Data: ${JSON.stringify(updatedVisitorData)}`,
      );

      console.log('Updated Visitor Data:', updatedVisitorData);

      // Call the service method to update the visitor in the database
      const updatedVisitor = await this.visitorsService.updateVisitor(
        updatedVisitorData,
        id,
        userId,
      );

      return updatedVisitor;
      // let visitorData = { ...updateVisitorDto };
      // this.logger.debug(
      //   `visitor Data beforehand: ${JSON.stringify(visitorData)}`,
      // );

      // if (updateVisitorDto.persons || updateVisitorDto.persons.length > 0) {
      //   visitorData.persons = updateVisitorDto.persons.map((person, index) => {
      //     const updatedPerson: any = {};

      //     if (person.name) {
      //       updatedPerson.name = person.name;
      //     } else {
      //       updatedPerson.name = existingVisitor.persons[index].name;
      //     }

      //     if (person.cnic) {
      //       updatedPerson.cnic = person.cnic.replace(/-/g, ''); // Clean up CNIC
      //     } else {
      //       updatedPerson.cnic = existingVisitor.persons[index].cnic;
      //     }
      //     this.logger.debug(`files => ${JSON.stringify(files)}`);
      //     if (person.cnicImage && files && files[index]) {
      //       this.logger.debug(
      //         `file IN IF CONDITION => ${JSON.stringify(files[index])}`,
      //       );
      //       const server = this.configService.get<string>('SERVER_URL');
      //       updatedPerson.cnicImage = `${server}/uploads/cnic-images/${files[index].filename}`;
      //       this.logger.debug(
      //         `updatedPerson.cnicImage=> ${JSON.stringify(updatedPerson.cnicImage)}`,
      //       );
      //     } else if (existingVisitor.persons[index]?.cnicImage) {
      //       this.logger.debug(
      //         `file IN ELSE CONDITION => ${JSON.stringify(files[index])}`,
      //       );
      //       updatedPerson.cnicImage = existingVisitor.persons[index].cnicImage;
      //       this.logger.debug(
      //         `existingVisitor->updatedperson.cnicImage=> ${JSON.stringify(updatedPerson.cnicImage)}`,
      //       );
      //     } else {
      //       this.logger.debug(
      //         `No file and no existing cnicImage for person at index ${index}`,
      //       );
      //       updatedPerson.cnicImage = null; // Handle this scenario appropriately
      //     }
      //     this.logger.debug(
      //       `updatedPerson before return =>  ${JSON.stringify(updatedPerson)}`,
      //     );
      //     return updatedPerson;
      //   });
      // }

      // const updatedVisitor = await this.visitorsService.updateVisitor(
      //   visitorData,
      //   id,
      //   userId,
      // );
      // this.logger.debug(
      //   `updatedVisitor before return =>  ${JSON.stringify(updatedVisitor)}`,
      // );
      // return updatedVisitor;
    } catch (error) {
      console.error('Error updating visitor:', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @Patch(':id')
  // @UseGuards(JwtAuthGuard)
  // async updateVisitor(
  //   @Param('id') id: number,
  //   @Body(new ValidationPipe()) updateVisitorDto: CreateVisitorDto,
  // ): Promise<any> {
  //   try {
  //     return await this.visitorsService.updateVisitor(id, updateVisitorDto);
  //   } catch (error) {
  //     console.error('Error updating visitor:', error);
  //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  //   }
  // }
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteVisitor(@Param('id') id: number): Promise<any> {
    try {
      const response = await this.visitorsService.deleteVisitor(id);
      return response;
    } catch (error) {
      console.error('Error deleting visitor:', error);
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}
