import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';
import { EventType } from 'src/enums/event-type.enum';
import { Timestamp } from 'typeorm';

export class CreateEventDto {
  @ApiProperty({
    description: 'User ID (required)',
    example: '2',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  userId?: number;

  @ApiProperty({
    description: 'Title of the event',
    example: 'NestJS Workshop',
  })
  @IsNotEmpty()
  @IsString()
  // @IsOptional()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Description of the event',
    example: 'A workshop on how to use NestJS effectively.',
  })
  @IsString()
  // @IsOptional()
  @IsNotEmpty()
  @MaxLength(5000)
  description: string;

  @ApiProperty({
    description: 'An array of event images in URL format',
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  eventImages: string[];

  @ApiProperty({
    description: 'Type of Event',
    example: EventType.WorkShop,
  })
  @IsEnum(EventType)
  @IsOptional()
  @IsNotEmpty()
  eventType: EventType;

  @ApiProperty({
    description: 'Location of the event',
    example: 'Expo Center',
  })
  @IsString()
  // @IsOptional()
  @IsNotEmpty()
  @MaxLength(255)
  location: string;

  @ApiProperty({
    description: 'Add a google location link or what is required',
    example:
      'https://www.google.com/maps/place/Expo+Centre+Karachi/@24.9019002,67.0741558,17z/data=!3m1!4b1!4m6!3m5!1s0x3eb33edf57c0d5f5:0x956c5a189579b59d!8m2!3d24.9018954!4d67.0767307!16s%2Fg%2F11cs2hdl5y?entry=ttu&g_ep=EgoyMDI0MDkxOC4xIKXMDSoASAFQAw%3D%3D',
  })
  @IsString()
  @IsOptional()
  // @IsUrl()
  locationLink: string;

  @ApiProperty({ description: 'Latitude', example: 24.9310076 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  latitude?: number;

  @ApiProperty({ description: 'Longitude', example: 67.1131247 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  longitude?: number;

  @ApiProperty({
    description: 'Start date and time of the event in ISO 8601 format',
    example: '2024-09-23T10:00:00Z',
  })
  @IsISO8601()
  // @IsOptional()
  @IsNotEmpty()
  startDateTime: string;

  @ApiProperty({
    description: 'End date and time of the event in ISO 8601 format',
    example: '2024-09-23T12:00:00Z',
  })
  @IsISO8601()
  // @IsOptional()
  @IsNotEmpty()
  // @IsDateString()
  endDateTime: string;

  @ApiProperty({
    description: 'Is the event free?',
    example: true,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isFree?: boolean;

  @ApiProperty({
    description: 'Is the event canceled?',
    example: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isCanceled?: boolean;

  @ApiProperty({
    description: 'Organizer Name',
    example: 'Zeeshan Aijaz',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  organizerName?: string;

  @ApiProperty({
    description: 'Organizer Contact',
    example: '+923333333333',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+92\s\d{10}$/, {
    message: 'Phone number must be in the format +92 1111111111',
  }) // Phone number validation for +92 format
  organizerContact?: string;
}
