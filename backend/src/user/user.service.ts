import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/typeorm/Entities/User';
import { Repository } from 'typeorm';
import { Complaint } from 'src/typeorm/Entities/Complaint';
import { ComplaintData } from '../complaint/interfaces/data.interface';
import { UpdateComplaintStatusDto } from '../complaint/dto/update-complaint.dto';
import { UserRole } from 'src/enums/userRole';
import * as bcrypt from 'bcrypt';
import { UpdateUserStatusDto } from 'src/chats/dto/update-user-status.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Complaint)
    private complaintRepository: Repository<Complaint>,
  ) {}

  async createUser(addData: CreateUserDto): Promise<User> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(addData.password, saltRounds);
    if (addData.cnic) {
      addData.cnic = addData.cnic.replace(/-/g, '');
    }

    const user = this.userRepository.create({
      ...addData,
      password: hashedPassword,
    });
    const userAdded = await this.userRepository.save(user);
    return userAdded;
  }
  async getUsers(
    skip,
    take,
    id: string,
    isVerified?: boolean,
    fullName?: string, // New parameter
  ): Promise<{ items: User[]; total: number }> {
    try {
      const query = this.userRepository.createQueryBuilder('user');
      if (id) {
        query.andWhere('user.id= :id', { id });
      }
      if (fullName) {
        query.andWhere('user.fullName LIKE :fullName', {
          fullName: `%${fullName}%`,
        });
      }

      query.orderBy('user.created_at', 'DESC');

      if (skip !== undefined && take !== undefined) {
        query.skip(skip).take(take);
      }

      const [items, total] = await query.getManyAndCount();

      if (!items || items.length === 0) {
        this.logger.warn('No users found matching the criteria.');
        return { items: [], total: 0 };
      }

      // const users = await query.getMany();
      // if (!users.length) {
      //   throw new NotFoundException('No users found');
      // }

      return { items, total };
    } catch (error) {
      this.logger.error('Error fetching users:', error.stack);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async getUserById(id: string): Promise<{ items: User[]; total: number }> {
    try {
      const query = this.userRepository.createQueryBuilder('user');
      if (id) {
        query.andWhere('user.id= :id', { id });
      }

      const [items, total] = await query.getManyAndCount();

      if (!items || items.length === 0) {
        this.logger.warn('No users found matching the criteria.');
        return { items: [], total: 0 };
      }

      return { items, total };
    } catch (error) {
      this.logger.error('Error fetching users:', error.stack);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (!updateData.role) {
      updateData.role = UserRole.RESIDENCE;
    }
    if (updateData.cnic) {
      const updateDataCnic = updateData.cnic.replace(/-/g, '');
      updateData.cnic = updateDataCnic.toString();
    }
    this.logger.debug('UpdatedData in service', updateData.cnic);
    const updatedUser = {
      ...user,
      ...updateData,
    };
    this.logger.debug('Merged User Object:', updatedUser);
    return await this.userRepository.save(updatedUser);
  }

  async updateUserStatus(
    updateUserStatusDto: UpdateUserStatusDto,
  ): Promise<void> {
    const { userId, status } = updateUserStatusDto; // Extract fields from the DTO

    // const userId_ = userparseInt(userId, 10);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Update user status
    user.status = status;
    await this.userRepository.save(user);
  }
}
