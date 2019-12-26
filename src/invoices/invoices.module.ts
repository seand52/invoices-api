import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesRepository } from './invoices.repository';
import { ClientsRepository } from '../clients/clients.repository';
import { ProductsRepository } from '../products/products.repository';
import { InvoiceToProductsRepository } from '../invoice-products/invoice-products.repository';
import { SalesOrdersRepository } from '../sales-orders/sales-orders.repository';
import { BusinessInfoRepository } from '../business-info/business-info.repository';
import { SalesOrdersToProductsRepository } from '../salesOrder-products/salesOrder-products.repository';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvoicesRepository]),
    TypeOrmModule.forFeature([ClientsRepository]),
    TypeOrmModule.forFeature([ProductsRepository]),
    TypeOrmModule.forFeature([InvoiceToProductsRepository]),
    TypeOrmModule.forFeature([SalesOrdersRepository]),
    TypeOrmModule.forFeature([BusinessInfoRepository]),
    TypeOrmModule.forFeature([SalesOrdersToProductsRepository]),
    ConfigModule,
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
