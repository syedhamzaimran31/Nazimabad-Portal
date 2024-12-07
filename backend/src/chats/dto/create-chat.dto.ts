import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateChatDto {
  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  chatRoomId: string;

  @IsInt()
  @IsOptional()
  @IsNotEmpty()
  senderId: number;

  @IsInt()
  @IsOptional()
  @IsNotEmpty()
  recipientId: number;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  message: string;

  @IsArray()
  @IsOptional()
  @IsUUID('all', { each: true })
  participantIds?: string[]; // Optional for message creation, required for chat room creation
}
