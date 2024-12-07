import { IsArray, ArrayNotEmpty,  IsInt } from 'class-validator';

export class CreateChatRoomDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  participantIds: number[];
}
