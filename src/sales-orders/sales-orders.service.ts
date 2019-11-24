import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvoicesRepository } from '../invoices/invoices.repository';
import { ClientsRepository } from '../clients/clients.repository';
import { ProductsRepository } from '../products/products.repository';
import { InvoiceToProductsRepository } from '../invoice-products/invoice-products.repository';
import { Pagination, paginate } from 'nestjs-typeorm-paginate';
import { SalesOrders } from './sales-orders.entity';
import { SalesOrdersRepository } from './sales-orders.repository';
import { SalesOrdersToProductsRepository } from '../salesOrder-products/salesOrder-products.repository';
import { FullSalesOrdersDetails } from './dto/output.dto';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { InvoicesService } from '../invoices/invoices.service';

@Injectable()
export class SalesOrdersService {
  constructor(
    @InjectRepository(SalesOrdersRepository)
    private salesOrdersRepository: SalesOrdersRepository,
    @InjectRepository(ClientsRepository)
    private clientsRepository: ClientsRepository,
    @InjectRepository(ProductsRepository)
    private productsRepository: ProductsRepository,
    @InjectRepository(SalesOrdersToProductsRepository)
    private salesOrdersToProductsRepository: SalesOrdersToProductsRepository,
    private readonly invoiceService: InvoicesService,
  ) {}

  async paginatesalesOrders(options, userId): Promise<Pagination<SalesOrders>> {
    const queryBuilder = this.salesOrdersRepository.createQueryBuilder(
      'sales_order',
    );
    queryBuilder
      .leftJoin('sales_order.client', 'client')
      .select([
        'sales_order',
        'client.name',
        'client.email',
        'client.telephone1',
      ])
      .where('sales_order.userId = :userId', { userId })
      .getMany();
    return paginate<SalesOrders>(queryBuilder, options);
  }

  async getSalesOrderById(id: number): Promise<FullSalesOrdersDetails> {
    const [invoice] = await this.salesOrdersRepository.retrieveInvoiceInfo(id);
    return invoice;
  }

  async deleteSalesOrderById(
    id: number,
    userId: number,
  ): Promise<{ message: string }> {
    const invoice = await this.salesOrdersRepository.findOne(id);
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    if (invoice.userId !== userId) {
      throw new UnauthorizedException(
        'You do not have permission to perform this request',
      );
    }

    await this.salesOrdersRepository.delete(invoice.id);
    return { message: 'OK' };
  }

  async saveSalesOrder(salesOrderData: CreateSalesOrderDto, userId) {
    const { clientId } = salesOrderData.settings;
    const { client, products } = await this.invoiceService.retrieveRelevantData(
      salesOrderData,
      clientId,
    );

    const totalPrice = this.invoiceService.calculateTotalprice(
      products,
      salesOrderData.settings,
    );
    const result = await this.salesOrdersRepository.createSalesOrder({
      ...salesOrderData.settings,
      totalPrice,
      userId,
    });

    await this.salesOrdersToProductsRepository.storeSalesOrderProducts(
      result.identifiers[0].id,
      products,
    );
    return 'OK';
  }

  async updateSalesOrder(invoiceData: CreateSalesOrderDto, invoiceId, userId) {
    const { clientId } = invoiceData.settings;
    const salesOrder = await this.salesOrdersRepository.findOne(invoiceId);
    if (!salesOrder) {
      throw new NotFoundException(
        'Could not find the invoice you are trying to edit',
      );
    }
    if (salesOrder.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to modify this invoice',
      );
    }
    const { client, products } = await this.invoiceService.retrieveRelevantData(
      invoiceData,
      clientId,
    );
    const totalPrice = this.invoiceService.calculateTotalprice(
      products,
      invoiceData.settings,
    );

    await this.salesOrdersRepository.updateSalesOrder(
      {
        ...invoiceData.settings,
        totalPrice,
        userId,
      },
      invoiceId,
    );

    await this.salesOrdersToProductsRepository.updateSalesOrderProducts(
      invoiceId,
      products,
    );
  }
}
