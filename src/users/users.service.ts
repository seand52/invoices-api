import { Injectable, ConflictException } from '@nestjs/common';
import { UserDto } from './users.dto';
import { getConnection, EntityManager } from 'typeorm';
import * as bycript from 'bcrypt';
import { Users } from './user.entity';

@Injectable()
export class UsersService {
  async create(data: UserDto) {
    try {
    const salt = await bycript.genSalt();
    const password = await this.hashPassword(data.password, salt);
    await getConnection()
      .createQueryBuilder()
      .insert()
      .into(Users)
      .values({ username: data.username, password, salt })
      .execute();
    return 'success';
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Username already exists');
      }
    }

  }

  private hashPassword(password: string, salt: string): string {
    return bycript.hash(password, salt);
  }

  async validateUserPassword(credentials: UserDto): Promise<boolean> {
    const {username, password } = credentials;
    const user = await this.findOne(username);

    return user && await user.validatePassword(password);
  }

  async findOne(username): Promise<Users> {
    const user = await getConnection()
    .createQueryBuilder()
    .select('user')
    .from(Users, 'user')
    .where('user.username = :username', { username })
    .getOne();

    return user;
  }
}
