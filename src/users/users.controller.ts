import { Controller, Get, Body, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {UserDto} from './users.dto';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
    ) {}

  @Post('register')
  registerUser(@Body() body: UserDto ): Promise<string> {
      return this.userService.create(body);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req): Promise<any> {
    return this.authService.login({
      id: req.user.id,
      username: req.user.username,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('test')
  getProfile(@Request() req) {
    return req.user;
  }

}
