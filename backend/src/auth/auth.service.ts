import { InjectRepository } from '@nestjs/typeorm';
import { LoginUserDto } from './dto/login-user.dto';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { User } from 'src/typeorm/Entities/User';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validDataUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    this.logger.debug(`User ID: ${user.id}`);

    const token = this.jwtService.sign({
      userId: user.id,
      role: user.role,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      email,
    });
    return {
      userId: user.id,
      userName: user.fullName,
      phoneNumber: user.phoneNumber,
      role: user.role,
      token,
    };
  }
}
