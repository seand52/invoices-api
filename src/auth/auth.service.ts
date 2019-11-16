import { Injectable } from '@nestjs/common';
import {UsersService} from '../users/users.service';
import {JwtService} from '@nestjs/jwt';
import { UserPayload } from '../users/users.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findOne(username);
    const isValidPassword = await this.userService.validateUserPassword({username, password});
    if (user && isValidPassword) {
      const {password, ...result} = user;
      return result;
    }
    return null;
  }

  async login(user: UserPayload) {
    const payload = {
      username: user.username,
      sub: user.id,
    };

    const jwtService = new JwtService({secret: 'secret key'});
    return {
      access_token: jwtService.sign(payload),
    };
  }
}
