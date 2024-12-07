import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitorsService } from './visitors.service';
import { VisitorsController } from './visitors.controller';
import { Visitors } from '../typeorm/Entities/visitor.entity';
import { User } from 'src/typeorm/Entities/User';
import { RegexHelper } from 'src/common/helpers/regex.helper';

@Module({
  imports: [TypeOrmModule.forFeature([Visitors, User])],
  providers: [VisitorsService, RegexHelper],
  controllers: [VisitorsController],
  exports: [VisitorsService],
})
export class VisitorsModule {}
