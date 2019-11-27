import { Repository, EntityRepository, getConnection } from 'typeorm';
import { Users } from './users.entity';
import { UserDto } from './users.dto';
import { ConflictException } from '@nestjs/common';

@EntityRepository(Users)
export class UserRespository extends Repository<Users> {
  async signUp(credentials: UserDto, salt: string) {
    const { username, password } = credentials;
    try {
      const user = await this.save({ username, password, salt });
      return { id: user.id, username: user.username };
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Username already exists');
      }
    }
  }
}
