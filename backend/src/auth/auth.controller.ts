import { AuthService } from './auth.service';
import {
  Controller,
  Post,
  Get,
  Req,
  Body,
  HttpCode,
  ValidationPipe,
  UsePipes,
  HttpException,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { LocalGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { Request } from 'express';

@Controller('user')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(200)
  @Post('/login')
  @UseGuards(LocalGuard) // here need local guard file
  Login(@Req() req: Request, @Body() loginUserDto: LoginUserDto) {
    return this.authService.validDataUser(loginUserDto); //passportjs keep token in req.user property
  }

  //how to varify the token at headers
  @HttpCode(200)
  @Post('/test')
  @UseGuards(JwtAuthGuard)
  Test(@Body() getBodyData: string, @Req() req: Request) {
    return { ...req.user, data: getBodyData, message: 'Token Verified' };
  }
}
