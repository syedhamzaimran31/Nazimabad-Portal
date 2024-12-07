import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateAnnouncementDto } from './create-announcement.dto';

export class UpdateAnnouncementDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  content: string;

  @IsString()
  @IsOptional()
  announcementImage: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  userId?: string;
}
