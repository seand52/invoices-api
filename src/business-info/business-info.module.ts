import { Module } from '@nestjs/common';
import { BusinessInfoController } from './business-info.controller';
import { BusinessInfoService } from './business-info.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessInfoRepository } from './business-info.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusinessInfoRepository]),
  ],
  controllers: [BusinessInfoController],
  providers: [BusinessInfoService],
})
export class BusinessInfoModule {}
