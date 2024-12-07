import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from './entities/announcement.entity';

@Injectable()
export class AnnouncementService {
  private readonly logger = new Logger(AnnouncementService.name);
  constructor(
    @InjectRepository(Announcement)
    private announcementRepository: Repository<Announcement>,
  ) {}

  async createAnnouncement(
    createAnnouncementDto: CreateAnnouncementDto,
  ): Promise<Announcement> {
    const announcement = this.announcementRepository.create(
      createAnnouncementDto,
    );
    const anouncementAdded =
      await this.announcementRepository.save(announcement);
    return anouncementAdded;
  }

  async getAnnouncements(
    skip: number,
    take: number,
    userId: number,
    id: string,
    announcementType?: string,
  ): Promise<{ items: Announcement[]; total: number }> {
    try {
      const query =
        this.announcementRepository.createQueryBuilder('announcement');
      this.logger.debug(`The User id in service: ${userId}`);
      if (userId) {
        query.where('announcement.userId = :userId', { userId });
      }

      if (id) {
        query.andWhere('announcement.id = :id', { id });
      }

      if (announcementType) {
        query.andWhere('announcement.announcementType = :announcementType', {
          announcementType,
        });
      }

      query.orderBy('announcement.created_at', 'DESC');

      if (skip !== undefined && take !== undefined) {
        query.skip(skip).take(take);
      }

      const [items, total] = await query.getManyAndCount();
      if (!items || items.length === 0) {
        this.logger.warn('No announcements found matching the criteria.');
        return { items: [], total: 0 };
      }

      return { items, total };
    } catch (error) {
      this.logger.error('Error fetching announcements:', error.stack);
      throw new InternalServerErrorException('Failed to fetch announcements');
    }
  }

  async updateAnnouncement(
    id: number,
    userId: string,
    UpdateAnnouncementDto: UpdateAnnouncementDto,
  ): Promise<UpdateAnnouncementDto> {
    const announcement = await this.announcementRepository.findOne({
      where: { id },
    });
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }
    this.logger.debug(
      `Updating Announcement with ID: ${id} with Data: ${JSON.stringify(UpdateAnnouncementDto)}`,
    );
    this.logger.debug(
      `DTO before update: ${JSON.stringify(UpdateAnnouncementDto)}`,
    );
    const result = await this.announcementRepository.update(id, {
      ...UpdateAnnouncementDto,
      userId,
    });

    this.logger.debug(`Update result: ${JSON.stringify(result)}`);
    if (result.affected === 0) {
      throw new InternalServerErrorException(
        `Failed to update Announcement with ID ${id}`,
      );
    }

    return this.announcementRepository.findOne({ where: { id } });
  }

  async deleteAnnouncement(id: number): Promise<void> {
    const result = await this.announcementRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
  }
}
