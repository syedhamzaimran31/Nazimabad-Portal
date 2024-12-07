import { IsString, IsNotEmpty, IsIn, IsInt, IsNumber } from 'class-validator';

export class UpdateUserStatusDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsIn(['online', 'offline'])
  status: 'online' | 'offline';
}
