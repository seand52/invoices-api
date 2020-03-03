import { Module } from '@nestjs/common';
import { BusinessInfoController } from './business-info.controller';
import { BusinessInfoService } from './business-info.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessInfoRepository } from './business-info.repository';
import { UsersService } from '../users/users.service';
import { UserRespository } from '../users/users.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusinessInfoRepository]),
    TypeOrmModule.forFeature([UserRespository]),
  ],
  controllers: [BusinessInfoController],
  providers: [BusinessInfoService],
})
export class BusinessInfoModule {}
