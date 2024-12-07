import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  MinLength,
  Length,
  Matches,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { UserRole } from 'src/enums/userRole';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  profileImage: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  fullName: string;

  @IsOptional()
  @Transform(({ value }) => String(value))
  @IsString()
  @Transform(({ value }) => (value ? String(value).replace(/-/g, '') : value))
  @Length(13, 13, { message: 'CNIC must be exactly 13 characters long' })
  @Matches(/^\d{13}$/, { message: 'CNIC must be a 13-digit number' })
  cnic?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  cnicImage?: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+92\s\d{10}$/, {
    message: 'Phone number must be in the format +92 1111111111',
  }) // Phone number validation for +92 format
  phoneNumber?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  huoseNo: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  @IsOptional()
  role: UserRole;

  @IsEmail()
  @IsOptional()
  recoveryEmail: string;
}
