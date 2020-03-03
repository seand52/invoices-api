import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRespository } from './users.repository';
import { ConfigModule } from '../config/config.module';
import { BusinessInfoService } from '../business-info/business-info.service';
import { BusinessInfoRepository } from '../business-info/business-info.repository';
@Module({
  imports: [
    TypeOrmModule.forFeature([UserRespository]),
    ConfigModule,
    TypeOrmModule.forFeature([BusinessInfoRepository]),
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthService, BusinessInfoService],
  exports: [UsersService],
})
export class UsersModule {}
