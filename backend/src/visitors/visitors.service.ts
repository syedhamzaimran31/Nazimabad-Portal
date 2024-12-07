import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Visitors } from '../typeorm/Entities/visitor.entity';
import { User } from '../typeorm/Entities/User';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { UpdateVisitorDto } from './dto/update-visitor.dto';
import { RegexHelper } from '../common/helpers/regex.helper';
import * as fs from 'fs';
import * as QRCode from 'qrcode';
import * as moment from 'moment';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class VisitorsService {
  private readonly logger = new Logger(VisitorsService.name);
  constructor(
    @InjectRepository(Visitors)
    private visitorRepository: Repository<Visitors>,
    private configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly regexHelper: RegexHelper,
  ) {}

  async createVisitor(
    createVisitorDto: CreateVisitorDto,
    userId: number,
  ): Promise<Visitors> {
    try {
      const userIdNumber = Number(userId); // Convert userId to number
      this.logger.debug(`Converted userIdNumber: ${userIdNumber}`);

      if (isNaN(userIdNumber)) {
        throw new BadRequestException('Invalid user ID');
      }
      const user = await this.userRepository.findOne({
        where: { id: userIdNumber },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const uniqueCode = uuidv4();
      console.log('Generated unique code:', uniqueCode);
      console.log('Type of qrCode:', typeof uniqueCode); // Should log 'string'

      const isVerified = false;
      const visitDate = moment(
        createVisitorDto.visitDate,
        'DD/MM/YYYY',
      ).toDate();

      const visitDay = moment(visitDate).format('dddd');
      const qrCodeString = String(uniqueCode);

      const qrData = {
        qrCode: qrCodeString,
      };

      const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData));

      const visitorData = {
        ...createVisitorDto,
        visitDate,
        visitDay,
        qrCode: qrCodeString,
        qrCodeImage,
        isVerified,
        userId,
      };

      const visitor = this.visitorRepository.create(visitorData);
      const savedVisitor = await this.visitorRepository.save(visitor);

      const response = {
        ...savedVisitor,
        qrCodeImage,
      };
      return response;
    } catch (error) {
      console.error('Error creating visitor:', error);
      throw new InternalServerErrorException('Failed to create visitor');
    }
  }

  async getVisitors(
    skip: number,
    take: number,
    id: string,
    role: string,
    userId: number,
    visitDate: string,
    isVerified?: boolean,
    checkInTime?: string,
    checkInTimeEnd?: string,
    checkOutTime?: string,
    checkOutTimeEnd?: string,
  ): Promise<{ items: Visitors[]; total: number }> {
    try {
      const query = this.visitorRepository.createQueryBuilder('visitor');
      if (visitDate) {
        visitDate = this.regexHelper.formatVisitDate(visitDate);
        const [visitYear, visitMonth, visitDay] = visitDate.split('/');

        console.log(`Visit Date: ${visitDate}`);
        console.log(
          `Visit Year: ${visitYear}, Visit Month: ${visitMonth}, Visit Day: ${visitDay}`,
        );

        if (visitYear) {
          query.andWhere(`YEAR(visitor.visitDate) = :visitYear`, { visitYear });
        }

        if (visitMonth) {
          query.andWhere(`MONTH(visitor.visitDate) = :visitMonth`, {
            visitMonth,
          });
        }

        if (visitDay) {
          query.andWhere(`DAY(visitor.visitDate) = :visitDay`, { visitDay });
        }
      }
      if (role === 'Resident') {
        query.where('visitor.createdBy = :userId', { userId });
      } else if (role === 'Admin') {
        // No additional filtering needed
      }

      if (checkInTime) {
        const formattedCheckInDate =
          this.regexHelper.formatCheckInDate(checkInTime);
        // const formattedCheckInTime =
        //   this.regexHelper.formatCheckInTime(checkInTime);

        if (formattedCheckInDate) {
          const [checkInYear, checkInMonth, checkInDay] =
            formattedCheckInDate.split('/');
          console.log(`Check-In Date: ${formattedCheckInDate}`);
          console.log(
            `Check-In Year: ${checkInYear}, Check-In Month: ${checkInMonth}, Check-In Day: ${checkInDay}`,
          );

          if (checkInYear) {
            query.andWhere(`YEAR(visitor.checkinTime) = :checkInYear`, {
              checkInYear,
            });
          }

          if (checkInMonth) {
            query.andWhere(`MONTH(visitor.checkinTime) = :checkInMonth`, {
              checkInMonth,
            });
          }

          if (checkInDay) {
            query.andWhere(`DAY(visitor.checkinTime) = :checkInDay`, {
              checkInDay,
            });
          }
        }

        // if (formattedCheckInTime) {
        //   if (formattedCheckInTime && checkInTimeEnd) {
        //          const formattedCheckInTimeEnd = `${formattedCheckInDate} ${checkInTimeEnd}:00`;
        //     this.logger.debug(
        //       `formattedCheckInTimeEnd ${formattedCheckInTimeEnd}`,
        //     );
        //     query.andWhere(
        //       `visitor.checkinTime BETWEEN :checkInTime AND :formattedCheckInTimeEnd`,
        //       { checkInTime, formattedCheckInTimeEnd },
        //     );
        //   } else if (formattedCheckInTime) {
        //     const [hours, minutes] = formattedCheckInTime.split(':');

        //     if (hours && hours !== '00') {
        //       query.andWhere('HOUR(visitor.checkinTime) = :hours', { hours });
        //     }

        //     if (minutes && minutes !== '00') {
        //       query.andWhere('MINUTE(visitor.checkinTime) = :minutes', {
        //         minutes,
        //       });
        //     }
        //   }
        // }
      }
      if (checkOutTime) {
        const formattedCheckOutDate =
          this.regexHelper.formatCheckInDate(checkOutTime);
        if (formattedCheckOutDate) {
          const [checkOutYear, checkOutMonth, checkOutDay] =
            formattedCheckOutDate.split('/');
          console.log(
            `Check-Out Year: ${checkOutYear}, Check-Out Month: ${checkOutMonth}, Check-Out Day: ${checkOutDay}`,
          );

          if (checkOutYear) {
            query.andWhere(`YEAR(visitor.checkoutTime) = :checkOutYear`, {
              checkOutYear,
            });
          }

          if (checkOutMonth) {
            query.andWhere(`MONTH(visitor.checkoutTime) = :checkOutMonth`, {
              checkOutMonth,
            });
          }

          if (checkOutDay) {
            query.andWhere(`DAY(visitor.checkoutTime) = :checkOutDay`, {
              checkOutDay,
            });
          }
        }
      }

      if (isVerified === true) {
        // Filter by verification status if provided
        query.andWhere('visitor.isVerified = :isVerified', { isVerified });
      }
      if (userId) {
        query.andWhere('visitor.userId = :userId', { userId });
      }
      if (id) {
        query.andWhere('visitor.id = :id', { id });
      }

      query.orderBy('visitor.createdAt', 'DESC');
      this.logger.debug(`QUERY PARAMS` + query.getSql(), query.getParameters());
      this.logger.debug(query.getSql());
      this.logger.debug(` ID FROM GET VISITORS${id}`);
      const total = await query.getCount();

      // Apply pagination
      const items = await query.skip(skip).take(take).getMany();

      return { items, total };
    } catch (error) {
      this.logger.error('Error fetching visitors:', error.stack);
      throw new InternalServerErrorException('Failed to fetch visitors');
    }
  }
  async verifyQrCode(uniqueCode: string): Promise<Visitors | null> {
    if (!uniqueCode || uniqueCode.trim() === '') {
      throw new NotFoundException('Invalid QR code');
    }

    try {
      const visitor = await this.visitorRepository.findOne({
        where: { qrCode: uniqueCode },
      });
      if (!visitor) {
        return null; //// QR code is invalid
      }

      if (!visitor.checkinTime) {
        visitor.checkinTime = new Date();
        visitor.isVerified = true;
        await this.visitorRepository.save(visitor);
      }
      return visitor;
    } catch (error) {
      console.error('Error verifying QR code:', error);
      throw new InternalServerErrorException('Failed to verify QR code');
    }
  }
  async getVisitorById(id: number): Promise<Visitors> {
    const visitor = await this.visitorRepository.findOne({ where: { id } });
    if (!visitor) {
      throw new NotFoundException(`Visitor with ID ${id} not found`);
    }
    return visitor;
  }

  async updateVisitor(
    updateVisitorDto: UpdateVisitorDto,
    id: number,
    userId: number,
  ): Promise<UpdateVisitorDto> {
    try {
      const userIdNumber = Number(userId); // Convert userId to number
      this.logger.debug(`ID in Controller ${id}`);
      const visitorIdNumber = Number(id); // Convert id to number
      this.logger.debug(`Converted userIdNumber: ${userIdNumber}`);
      this.logger.debug(`Converted visitorIdNumber: ${visitorIdNumber}`);

      const existingVisitor = await this.visitorRepository.findOne({
        // where: { id: visitorIdNumber, userId: userIdNumber },
        where: { id: visitorIdNumber },
      });

      if (!existingVisitor) {
        throw new NotFoundException('Visitor not found');
      }

      this.logger.debug(`Existing Visitor: ${existingVisitor}`);
      this.logger.debug(`updateVisitorDto In Service: ${updateVisitorDto}`);
      const updatedData = {
        ...existingVisitor, // existing data
        ...updateVisitorDto, // updated fields
        userId,
      };

      if (updateVisitorDto.visitDate) {
        const visitDate = moment(
          updateVisitorDto.visitDate,
          'DD/MM/YYYY',
        ).toDate();
        updatedData.visitDate = visitDate;
        updatedData.visitDay = moment(visitDate).format('dddd');
      }

      if (updateVisitorDto.qrCode) {
        const uniqueCode = uuidv4();
        const qrCodeString = String(uniqueCode);

        const qrData = {
          qrCode: qrCodeString,
        };

        const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData));
        updatedData.qrCode = qrCodeString;
        updatedData.qrCodeImage = qrCodeImage;
      }

      await this.visitorRepository.update(visitorIdNumber, updatedData);
      this.logger.debug(updatedData);

      const updatedVisitor = await this.visitorRepository.findOne({
        where: { id: visitorIdNumber },
      });

      if (!updatedVisitor) {
        throw new NotFoundException(
          `Visitor with ID ${id} not found after update`,
        );
      }
      this.logger.debug(updatedVisitor);

      return updatedVisitor;
    } catch (error) {
      console.error('Error updating visitor:', error);
      throw new InternalServerErrorException('Failed to update visitor');
    }
  }

  async deleteVisitor(id: number): Promise<any> {
    const result = await this.visitorRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Visitor with ID ${id} not found`);
    }
    return { staus: 'success' };
  }
}
