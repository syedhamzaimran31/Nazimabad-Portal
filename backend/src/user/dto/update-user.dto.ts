import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  MinLength,
  MaxLength,
  Length,
  Matches,
  IsOptional,
} from 'class-validator';
import { UserRole } from 'src/enums/userRole';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  profileImage: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(50)
  fullName: string;

  @IsOptional()
  @Transform(({ value }) => (value ? String(value).replace(/-/g, '') : value))
  @IsString()
  @IsOptional()
  // @Length(13, 13, { message: 'CNIC must be exactly 13 characters long' })
  @Matches(/^\d{13}$/, { message: 'CNIC must be a 13-digit number' })
  cnic?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  cnicImage?: string;

  @IsNotEmpty()
  @IsEmail()
  @IsOptional()
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
  houseNo: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MinLength(4)
  password: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  @IsOptional()
  @Transform(({ value }) => value ?? UserRole.RESIDENCE)
  role: UserRole;

  @IsEmail()
  @IsOptional()
  recoveryEmail: string;
}
