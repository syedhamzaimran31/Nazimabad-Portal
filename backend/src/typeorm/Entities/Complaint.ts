import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ComplaintStatus } from 'src/enums/complaintStatus';
import { ComplaintType } from 'src/enums/complaint-type.enum';

@Entity({ name: 'complaints' })
export class Complaint {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ nullable: true })
  userId: number;

  @Column({ length: 255 })
  fullName: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 255 })
  complaint: string;

  @Column({
    type: 'enum',
    enum: ComplaintType,
    default: ComplaintType.OTHER,
  })
  complaintType: ComplaintType;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ComplaintStatus,
    default: ComplaintStatus.PENDING,
  })
  complaintStatus: ComplaintStatus;

  @Column({ type: 'varchar', nullable: true })
  response: string;

  @Column()
  complaintImage: string;

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
}
