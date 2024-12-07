import { EntityRepository, Repository } from 'typeorm';
import { User } from '../typeorm/Entities/User';

@EntityRepository(User)
export class userRepository extends Repository<User> {}
