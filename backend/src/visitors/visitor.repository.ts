import { EntityRepository, Repository } from 'typeorm';
import { Visitors } from '../typeorm/Entities/visitor.entity';

@EntityRepository(Visitors)
export class VisitorRepository extends Repository<Visitors> {}