import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VehicleType } from '../../enums/vehicle-type.enum';
import { User } from '../Entities/User';
@Entity({ name: 'visitors' })
export class Visitors {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: VehicleType,
  })
  vehicleType: VehicleType;

  @Column({ length: 20 })
  numberPlate: string;

  @Column()
  numberOfPersons: number;

  @Column('simple-json')
  persons: { name: string; cnic: string; cnicImage: string }[];

  @Column({ type: 'date' })
  visitDate: Date;

  @Column()
  visitDay: string;

  @Column({ type: 'varchar', unique: true })
  qrCode: string;

  @Column({ type: 'timestamp', nullable: true })
  checkinTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  checkoutTime: Date;

  @Column({ type: 'longtext' })
  qrCodeImage: string;

  @Column()
  isVerified: boolean;

  @Column({
    nullable: false,
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.visitors)
  @JoinColumn({ name: 'userId' })
  user: User;
}
