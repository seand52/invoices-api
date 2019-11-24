import { Module } from '@nestjs/common';
import { SalesOrdersController } from './sales-orders.controller';
import { SalesOrdersService } from './sales-orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesOrdersRepository } from './sales-orders.repository';
import { ClientsRepository } from '../clients/clients.repository';
import { ProductsRepository } from '../products/products.repository';
import { SalesOrdersToProductsRepository } from '../salesOrder-products/salesOrder-products.repository';
import { InvoicesService } from '../invoices/invoices.service';
import { InvoicesRepository } from '../invoices/invoices.repository';
import { InvoiceToProductsRepository } from '../invoice-products/invoice-products.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvoicesRepository]),
    TypeOrmModule.forFeature([SalesOrdersRepository]),
    TypeOrmModule.forFeature([ClientsRepository]),
    TypeOrmModule.forFeature([ProductsRepository]),
    TypeOrmModule.forFeature([SalesOrdersToProductsRepository]),
    TypeOrmModule.forFeature([InvoiceToProductsRepository]),
  ],
  controllers: [SalesOrdersController],
  providers: [SalesOrdersService, InvoicesService],
})
export class SalesOrdersModule {}
