import {
  Controller,
  Body,
  Post,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserDto } from './users.dto';
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
  async registerUser(@Body() body: UserDto): Promise<{ access_token: string }> {
    const { id, username } = await this.userService.create(body);
    return this.authService.login({
      id,
      username,
    });
  }

  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(
    @Request() req,
    @Body() user: UserDto,
  ): Promise<{ access_token: string }> {
    return this.authService.login({
      id: req.user.id,
      username: req.user.username,
    });
  }
}
