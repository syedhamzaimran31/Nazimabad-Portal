import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { FileUrlProvider } from 'src/common/providers/file-url.provider';
import { ApiMessageDataPagination } from 'src/types';
import { GetQueryEventDto } from './dto/get-events.dto';
import { extractLatLongFromLink, safeParse } from 'src/utils';
import { UserPayload } from 'src/user/interface/token.interface';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly fileUrlProvider: FileUrlProvider, // Inject the FileUrlProvider
  ) {}

  async createEvent(
    createEventDto: CreateEventDto,
    files: Express.Multer.File[],
    req: any,
  ): Promise<{ status: string; createdEvent?: Event; message?: string }> {
    // if (!files || files.length === 0) {
    //   return { status: 'Error', message: 'No files uploaded.' };
    // }

    const { userId } = req.user as UserPayload;

    // Use the getImageUrls method from FileUrlProvider
    const imageUrls = this.fileUrlProvider.getImageUrls(files, 'event-images');

    // let latitude: number | undefined;
    // let longitude: number | undefined;

    let { latitude, longitude } = createEventDto;

    // Extract latitude and longitude from locationLink
    const locationLink_ = createEventDto.locationLink;
    if ((!latitude || !longitude) && locationLink_) {
      const coords = extractLatLongFromLink(locationLink_);
      if (coords) {
        latitude = coords.latitude;
        longitude = coords.longitude;
      }
    }

    // Remove locationLink from the DTO before creating the event
    const { locationLink, ...eventData } = createEventDto;

    let isFree: boolean = createEventDto.isFree !== undefined 
    ? String(createEventDto.isFree).toLowerCase() === 'true'
    : true;

    let isCanceled: boolean =
      String(createEventDto.isCanceled).toLowerCase() === 'true';

    console.log({
      isFree,
      isCanceled,
    });

    // const { eventImages } = createEventDto;
    const eventImagesArray = imageUrls?.length ? imageUrls : [];

    const newEvent = this.eventRepository.create({
      ...eventData,
      isFree, // Ensure boolean
      isCanceled, // Ensure boolean
      eventImages: eventImagesArray,
      latitude,
      longitude,
      userId: Number(userId),
    });

    const eventAdded = await this.eventRepository.save(newEvent);
    return { status: 'Successful', createdEvent: eventAdded };
  }
  async getEvents(
    getQueryEventDto: GetQueryEventDto,
  ): Promise<ApiMessageDataPagination> {
    const {
      searchQuery,
      userId,
      page = 1,
      limit = 15,
      sort = 'DESC',
    } = getQueryEventDto;
    const skip = (page - 1) * limit;

    const qb = await this.eventRepository.createQueryBuilder('events');

    if (userId) {
      qb.where('events.userId = :userId', { userId: Number(userId) }); // Ensure userId is a number
    }

    qb.skip(skip).take(limit).orderBy('"created_at"', sort);

    const [items, total] = await qb.getManyAndCount();

    const parsedItems = items.map((item) => ({
      ...item,
      eventImages: safeParse(item.eventImages) || [], // Handle parsing or fallback to an empty array
    }));
    const lastPage = Math.ceil(total / limit);

    return {
      message: 'Success',
      data: parsedItems,
      page,
      lastPage,
      total,
      limit,
    };
  }

  async getEvent(id: number) {
    const event = await this.eventRepository.findOne({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`No event with ${id} found`);
    }

    return { message: 'sucess', data: event };
  }

  async updateEvents(
    id: number,
    updateEventDto: UpdateEventDto,
    files: Express.Multer.File[],
    req: any,
  ): Promise<{ status: string; updatedEvent?: Event; message?: string }> {
    const existingEvent = await this.eventRepository.findOne({ where: { id } });

    if (!existingEvent) {
      throw new NotFoundException(`No event with ID ${id} found`);
    }
    const { userId } = req.user as UserPayload;

    let { latitude, longitude } = updateEventDto;

    // Extract latitude and longitude from locationLink
    const locationLink_ = updateEventDto.locationLink;
    if ((!latitude || !longitude) && locationLink_) {
      const coords = extractLatLongFromLink(locationLink_);
      if (coords) {
        latitude = coords.latitude;
        longitude = coords.longitude;
      }
    }

    // Remove locationLink from the DTO before creating the event
    const { locationLink, ...eventData } = updateEventDto;

    let isFree: boolean =
      String(updateEventDto.isFree).toLowerCase() === 'true';
    let isCanceled: boolean =
      String(updateEventDto.isCanceled).toLowerCase() === 'true';

    const eventImagesArray =
      files && files.length
        ? this.fileUrlProvider.getImageUrls(files, 'event-images')
        : existingEvent.eventImages || [];

    const updatedEvent = this.eventRepository.merge(existingEvent, {
      ...eventData,
      isFree,
      isCanceled,
      eventImages: eventImagesArray,
      latitude,
      longitude,
      userId: Number(userId),
    });

    // Merge the existing event with the new data
    // const updatedEvent = this.eventRepository.merge(
    //   existingEvent,
    //   updateEventDto,
    // );

    // Save the updated event
    await this.eventRepository.save(updatedEvent);

    return { status: 'Successful', updatedEvent };
  }

  async deleteEvents(id: number): Promise<void> {
    const result = await this.eventRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }
  }
}
