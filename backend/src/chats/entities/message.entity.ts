import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ChatRoom } from './chat-room.entity';
import { User } from 'src/typeorm/Entities/User';
// import { User } from './user.entity';

@Entity({ name: 'message' })
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.message)
  chatRoom: ChatRoom;

  @ManyToOne(() => User, (user) => user.messages)
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedMessages)
  recipient: User;

  @Column()
  message: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  sentAt: Date;

  @Column({ default: 'delivered' })
  status: string;
}
