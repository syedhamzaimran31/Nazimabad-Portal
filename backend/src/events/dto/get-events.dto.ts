// import { Trim } from '@decorators/trim.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Trim } from 'src/common/decorators/trim.decorator';
import { PaginationQueryDto } from 'src/dto';
import { EventType } from 'src/enums/event-type.enum';
import { sortEnum } from 'src/types';

export class GetQueryEventDto extends PaginationQueryDto {
  
  @IsOptional()
  @IsString()
  @Trim()
  searchQuery?: string;

  @IsOptional()
  @IsString()
  @Trim()
  @IsEnum(EventType)
  @ApiProperty({ description: 'Event names in enums' })
  eventType?: string;

  @IsOptional()
  @IsString()
  @Trim()
  @IsEnum(sortEnum)
  @ApiProperty({ description: 'Sort event by' })
  sort?: 'ASC' | 'DESC';

  @IsOptional()
  @IsInt()
  @Trim()
  @Type(() => Number)
  @ApiProperty({ description: 'fetch by specific users' })
  userId?: number;
}
