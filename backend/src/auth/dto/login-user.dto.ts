import {
  IsString,
  IsNotEmpty,
  MinLength,
  IsEmail,
  IsInt,
} from 'class-validator';

export class LoginUserDto {
  
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;
}
