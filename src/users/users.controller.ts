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
import { BusinessInfoService } from '../business-info/business-info.service';
import { AuthResponse } from './dto/auth';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
    private readonly businessInfoService: BusinessInfoService,
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
  async login(@Request() req, @Body() user: UserDto): Promise<AuthResponse> {
    debugger;
    const auth = await this.authService.login({
      id: req.user.id,
      username: req.user.username,
    });
    const businessInfo = await this.businessInfoService.getBusinessInfo(
      req.user.id,
    );
    debugger;
    return { access_token: auth.access_token, businessInfo };
  }
}
