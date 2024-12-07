import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { ComplaintType } from 'src/enums/complaint-type.enum';

export class ComplaintDTO {
  
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  complaint: string;

  @IsEnum(ComplaintType)
  @IsNotEmpty()
  @IsOptional()
  complaintType: ComplaintType;

  @IsString()
  @IsOptional()
  description: string;

  @IsOptional()
  @IsString()
  complaintImage: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  userId?: number;

}
