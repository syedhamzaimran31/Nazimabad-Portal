// src/chat/dto/get-chat.dto.ts

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Trim } from 'src/common/decorators/trim.decorator';

export class GetQueryChatDto {
  @IsOptional() // chatRoomId is optional for getMessagesByChatRoom
  @IsString()
  @Trim()
  chatRoomId?: string;

  @IsOptional() 
  @IsString()
  @Trim()
  userId: string;

  @IsOptional() // otherUserId is optional for getChatHistory
  @IsString()
  @Trim()
  otherUserId?: string;
}
