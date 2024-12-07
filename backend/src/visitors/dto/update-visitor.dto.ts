import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsArray,
  ValidateNested,
  IsEnum,
  IsInt,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type, Transform, plainToClass } from 'class-transformer';
import { VehicleType } from '../../enums/vehicle-type.enum';
import * as moment from 'moment';
import { Timestamp } from 'typeorm';

class Person {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  cnic: string;

  @IsOptional()
  @IsString()
  cnicImage: string;
}

export class UpdateVisitorDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  userId?: number;

  @IsOptional()
  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @IsOptional()
  @IsString()
  numberPlate: string;

  @IsOptional()
  @IsNotEmpty()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10)) // convert to integer
  numberOfPersons: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Person)
  persons: Person[];

  @IsOptional()
  @IsString()
  // @Transform(({ value }) => moment(value, 'DD/MM/YYYY').toDate())
  visitDate: Date;

  @IsOptional()
  @IsString()
  visitDay?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => String(value)) // Ensure conversion to string
  qrCode: string;

  @IsOptional()
  @IsDate()
  checkinTime: Date;

  @IsOptional()
  @IsDate()
  checkoutTime: Date;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => String(value)) // Ensure conversion to string
  qrCodeImage: string;

  @IsOptional()
  @IsBoolean()
  @IsOptional()
  isVerified: boolean;
}
