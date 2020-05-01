import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsRepository } from './clients.repository';
import { InvoicesRepository } from '../invoices/invoices.repository';
import { ConfigModule } from '../config/config.module';
import { SalesOrdersRepository } from '../sales-orders/sales-orders.repository';
import { ProductsRepository } from '../products/products.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClientsRepository]),
    TypeOrmModule.forFeature([InvoicesRepository]),
    TypeOrmModule.forFeature([SalesOrdersRepository]),
    TypeOrmModule.forFeature([ProductsRepository]),
    ConfigModule,
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}
