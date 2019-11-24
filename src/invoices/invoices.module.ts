import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesRepository } from './invoices.repository';
import { ClientsRepository } from '../clients/clients.repository';
import { ProductsRepository } from '../products/products.repository';
import { InvoiceToProductsRepository } from '../invoice-products/invoice-products.repository';
import { SalesOrdersRepository } from '../sales-orders/sales-orders.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([InvoicesRepository]),
    TypeOrmModule.forFeature([ClientsRepository]),
    TypeOrmModule.forFeature([ProductsRepository]),
    TypeOrmModule.forFeature([InvoiceToProductsRepository]),
    TypeOrmModule.forFeature([SalesOrdersRepository]),
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
