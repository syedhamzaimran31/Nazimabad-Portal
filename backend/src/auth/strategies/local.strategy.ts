import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // By default, Passport uses 'username', but you can change it to 'email' or any other field
    });
  }

  async validate(email: string, password: string) {
    const { userId, token } = await this.authService.validDataUser({
      email,
      password,
    });
    console.log('Inside LocalStrategy');
    if (!userId) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    return { userId, token };
  }
}
