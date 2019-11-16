import { Controller, Body, Post, UseGuards, Request, UsePipes, ValidationPipe } from '@nestjs/common';
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

  @UsePipes(ValidationPipe)
  @Post('register')
  registerUser(@Body() body: UserDto ): Promise<string> {
      return this.userService.create(body);
  }

  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req, @Body() user: UserDto): Promise<any> {
    return this.authService.login({
      id: req.user.id,
      username: req.user.username,
    });
  }

}
