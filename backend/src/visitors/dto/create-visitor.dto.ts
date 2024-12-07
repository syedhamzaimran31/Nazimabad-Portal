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
  @IsString()
  name: string;

  @IsString()
  cnic: string;

  @IsOptional()
  @IsString()
  cnicImage: string;
}

export class CreateVisitorDto {

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  userId?: number;

  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @IsString()
  numberPlate: string;

  @IsNotEmpty()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10)) // convert to integer
  numberOfPersons: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Person)
  persons: Person[];

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

  @IsString()
  @IsOptional()
  @Transform(({ value }) => String(value)) // Ensure conversion to string
  qrCodeImage: string;

  @IsBoolean()
  @IsOptional()
  isVerified: boolean;

}
