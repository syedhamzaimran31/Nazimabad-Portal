import { Module } from '@nestjs/common';
import { ComplaintService } from './complaint.service';
import { ComplaintController } from './complaint.controller';
import { Complaint } from 'src/typeorm/Entities/Complaint';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Complaint]), AuthModule, ConfigModule],
  controllers: [ComplaintController],
  providers: [ComplaintService],
  exports: [ 
    ComplaintService,
    TypeOrmModule, // Export TypeOrmModule so that ComplaintRepository can be used elsewhere
  ],
})
export class ComplaintModule {}
