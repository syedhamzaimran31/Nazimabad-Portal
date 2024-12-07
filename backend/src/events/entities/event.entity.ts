import { EventType } from 'src/enums/event-type.enum';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userId: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 5000 })
  description: string;

  @Column({ type: 'json' })
  eventImages: string[];

  // @Column()
  // eventImages: string[];

  @Column({ type: 'enum', enum: EventType, default: EventType.Other })
  eventType: EventType;

  @Column({ type: 'varchar', length: 255 })
  location: string;

  // @Column({ type: 'varchar', length: 700, nullable: true })
  // locationLink: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startDateTime: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  endDateTime: Date;

  @Column({ type: 'boolean', default: true })
  isFree: boolean;

  @Column({ type: 'boolean', default: false })
  isCanceled: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  organizerName?: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  organizerContact?: string; // Limited to 15 characters to accommodate the +92 format

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
