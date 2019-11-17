import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {AuthService} from '../auth/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRespository } from './users.repository';
@Module({
  imports: [
    TypeOrmModule.forFeature([UserRespository]),
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthService],
  exports: [UsersService],
})
export class UsersModule {}
