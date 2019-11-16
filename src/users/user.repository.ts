import {Repository, EntityRepository, getConnection} from 'typeorm';
import { Users } from './user.entity';
import { UserDto } from './users.dto';
import { ConflictException } from '@nestjs/common';

@EntityRepository(Users)
export class UserRespository extends Repository<Users> {
  async signUp(credentials: UserDto, salt: string) {
    const {username, password} = credentials;
    try {
      await this.insert({username, password, salt});
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Username already exists');
      }
    }
  }
}
