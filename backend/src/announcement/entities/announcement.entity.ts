import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'announcements' })
export class Announcement {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: true })
  userId: string;

  @Column({ length: 255 })
  fullName: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 500 })
  title: string;

  @Column({ length: 5000 })
  content: string;

  @Column()
  announcementImage: string;

  @Column({
    nullable: false,
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
}
