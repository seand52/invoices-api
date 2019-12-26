import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsRepository } from './clients.repository';
import { InvoicesRepository } from '../invoices/invoices.repository';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClientsRepository]),
    TypeOrmModule.forFeature([InvoicesRepository]),
    ConfigModule,
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}
