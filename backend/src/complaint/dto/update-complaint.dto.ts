import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ComplaintStatus } from 'src/enums/complaintStatus';

export class UpdateComplaintStatusDto {
  @IsEnum(ComplaintStatus)
  @IsNotEmpty()
  @IsOptional()
  complaintStatus: ComplaintStatus;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  response: string;
}
