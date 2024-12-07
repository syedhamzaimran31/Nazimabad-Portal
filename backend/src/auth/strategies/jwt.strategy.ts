import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

interface UserPayload {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //cookies,body
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  validate(payload: UserPayload) {
    console.log('Inside JWT Strategy Validate');
    console.log('Payload', payload);
    const { userId, email, fullName, phoneNumber, role } = payload;

    return { userId, email, fullName, phoneNumber, role };
  }
}
