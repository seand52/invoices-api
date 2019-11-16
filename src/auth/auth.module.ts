import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import {JwtStrategy} from '../auth/jwt.strategy';

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({
    secret: 'secret key',
    signOptions: {expiresIn: '2h'},
  })],
  providers: [AuthService, LocalStrategy, UsersService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
