import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsRepository } from './clients.repository';
import { InvoicesRepository } from '../invoices/invoices.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClientsRepository]),
    TypeOrmModule.forFeature([InvoicesRepository]),
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}
