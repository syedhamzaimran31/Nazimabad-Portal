import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from 'src/enums/userRole';
import { Visitors } from './visitor.entity';
import { Message } from 'src/chats/entities/message.entity';
import { ChatRoom } from 'src/chats/entities/chat-room.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ length: 255 })
  fullName: string;

  @Column({ default: null })
  cnic: string;

  @Column({ nullable: true })
  cnicImage: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  phoneNumber?: string; // Limited to 15 characters to accommodate the +92 format

  @Column({ nullable: true })
  houseNo: string;

  @Column({ length: 255, nullable: true })
  recoveryEmail: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.RESIDENCE,
  })
  role: UserRole;

  @Column({
    nullable: false,
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastSeen: Date;

  @Column({ default: 'offline' })
  status: string;

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @OneToMany(() => Message, (message) => message.recipient)
  receivedMessages: Message[];

  @OneToMany(() => ChatRoom, (chatRoom) => chatRoom.participants)
  chatRooms: ChatRoom[];

  @OneToMany(() => Visitors, (visitor) => visitor.user)
  visitors: Visitors[];
}
