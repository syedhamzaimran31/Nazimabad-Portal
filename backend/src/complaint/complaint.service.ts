import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { Complaint } from 'src/typeorm/Entities/Complaint';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplaintData } from './interfaces/data.interface';
import { UpdateComplaintStatusDto } from './dto/update-complaint.dto';
import { ComplaintDTO } from './dto/create-complaint.dto';

@Injectable()
export class ComplaintService {
  private readonly logger = new Logger(ComplaintService.name);
  constructor(
    @InjectRepository(Complaint)
    private complaintRepository: Repository<Complaint>,
  ) {}

  async addUserComplaint(data: ComplaintData): Promise<Complaint> {
    const complaint = this.complaintRepository.create(data);
    const complaintAdded = await this.complaintRepository.save(complaint);
    return complaintAdded;
  }

  async getComplaint(
    skip: number,
    take: number,
    userId: number,
    id: string,
    complaintType?: string,
  ): Promise<{ items: Complaint[]; total: number }> {
    try {
      const query = this.complaintRepository.createQueryBuilder('complaint');
      this.logger.debug(`The User id in service: ${userId}`);
      if (userId) {
        query.where('complaint.userId = :userId', { userId });
      }

      if (id) {
        query.andWhere('complaint.id = :id', { id });
      }

      if (complaintType) {
        query.andWhere('complaint.complaintType = :complaintType', {
          complaintType,
        });
      }

      
      query.orderBy('complaint.created_at', 'DESC');

      if (skip !== undefined && take !== undefined) {
        query.skip(skip).take(take);
      }

      const [items, total] = await query.getManyAndCount();
      if (!items || items.length === 0) {
        this.logger.warn('No complaints found matching the criteria.');
        return { items: [], total: 0 };
      }

      return { items, total };
    } catch (error) {
      this.logger.error('Error fetching complaints:', error.stack);
      throw new InternalServerErrorException('Failed to fetch complaints');
    }
  }

  async getComplaintById(id: number): Promise<Complaint> {
    const complaint = await this.complaintRepository.findOne({ where: { id } });
    this.logger.debug(`Complaint with id ${id}`);
    if (!complaint) {
      throw new NotFoundException(`Visitor with ID ${id} not found`);
    }
    return complaint;
  }

  async updateComplaintAdmin(
    id: number,
    updateComplaintStatusDto: UpdateComplaintStatusDto,
  ): Promise<any> {
    const complaintById = await this.complaintRepository.findOne({
      where: { id },
    });

    if (!complaintById) {
      throw new NotFoundException(`Complaint with ID ${id} not found`);
    }

    this.logger.debug(`Response: ${updateComplaintStatusDto.response}`);
    this.logger.debug(
      `Complaint Status: ${updateComplaintStatusDto.complaintStatus}`,
    );

    const { response, complaintStatus } = updateComplaintStatusDto;

    // if (!response && !complaintStatus) {
    //   throw new HttpException(
    //     'No valid update fields provided',
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }

    const result = await this.complaintRepository.update(id, {
      response,
      complaintStatus,
    });

    const updatedComplaint = await this.complaintRepository.findOne({
      where: { id },
    });

    if (!updatedComplaint) {
      throw new NotFoundException(
        `Complaint with ID ${id}  not found after update`,
      );
    }

    return {
      complaint: updatedComplaint.complaint,
      complaintType: updatedComplaint.complaintType,
      description: updatedComplaint.description,
      complaintImage: updatedComplaint.complaintImage,
      response: updatedComplaint.response,
      complaintStatus: updatedComplaint.complaintStatus,
    };

    // // Prepare the update data
    // const updateData: Partial<UpdateComplaintStatusDto> = {};
    // if (updateComplaintStatusDto.complaintStatus) {
    //   updateData.complaintStatus = updateComplaintStatusDto.complaintStatus;
    // }
    // if (updateComplaintStatusDto.response) {
    //   updateData.response = updateComplaintStatusDto.response;
    // }

    // const result = await this.complaintRepository.update(
    //   complaintId,
    //   updateData,
    // );

    // // Check if any rows were affected
    // if (result.affected === 0) {
    //   throw new NotFoundException(`Complaint with id ${id} not found`);
    // }

    // this.logger.debug(`Update result: ${JSON.stringify(result)}`);

    // // Return the updated entity
    // const updatedComplaint = await this.complaintRepository.findOne({
    //   where: { id: complaintId },
    // });
    // if (!updatedComplaint) {
    //   throw new NotFoundException(
    //     `Complaint with id ${id} not found after update`,
    //   );
    // }

    // return updatedComplaint;
  }
  async updateComplaintUser(
    id: number,
    userId: number,
    updateComplaintStatusDto: ComplaintDTO,
  ): Promise<ComplaintDTO> {
    this.logger.debug(
      `Updating Complaint with ID: ${id} with Data: ${JSON.stringify(updateComplaintStatusDto)}`,
    );
    const complaintById = await this.complaintRepository.findOne({
      where: { id, userId },
    });
    if (!complaintById) {
      throw new NotFoundException(
        `Complaint with ID ${id} and USER ID ${userId} not found`,
      );
    }

    this.logger.debug(
      `Updating Complaint with ID: ${id} with Data: ${JSON.stringify(updateComplaintStatusDto)}`,
    );
    const { complaint, complaintType, description, complaintImage } =
      updateComplaintStatusDto;

    if (!complaint && !complaintType && !description && !complaintImage) {
      throw new HttpException(
        'No valid update fields provided',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.complaintRepository.update(id, {
      complaint,
      complaintType,
      description,
      complaintImage,
    });

    const updatedComplaint = await this.complaintRepository.findOne({
      where: { id, userId },
    });

    if (!updatedComplaint) {
      throw new NotFoundException(
        `Complaint with ID ${id} and ${userId} not found after update`,
      );
    }

    return {
      complaint: updatedComplaint.complaint,
      complaintType: updatedComplaint.complaintType,
      description: updatedComplaint.description,
      complaintImage: updatedComplaint.complaintImage,
    };
  }
  async deleteComplaint(id: number): Promise<any> {
    const result = await this.complaintRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Complaint with ID ${id} not found`);
    }
    return { staus: 'success' };
  }
}
