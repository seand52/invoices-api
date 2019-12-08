import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { ClientsRepository } from '../clients/clients.repository';
import { generatePdf } from '../helpers/generate_pdf';
import { generateSalesOrderTemplate } from '../helpers/sales_order_template';
import { InvoicesService } from '../invoices/invoices.service';
import { ProductsRepository } from '../products/products.repository';
import { SalesOrdersToProductsRepository } from '../salesOrder-products/salesOrder-products.repository';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { FullSalesOrdersDetails } from './dto/output.dto';
import { SalesOrders } from './sales-orders.entity';
import { SalesOrdersRepository } from './sales-orders.repository';

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
      .where('sales_order.userId = :userId', { userId });

    if (options.clientName !== '') {
      queryBuilder.where('client.name like :name', {
        name: '%' + options.clientName + '%',
      });
    }
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
    debugger;
    const { clientId } = salesOrderData.settings;
    const {
      client,
      products,
      businessInfo,
    } = await this.invoiceService.retrieveRelevantData(
      salesOrderData,
      clientId,
      userId,
    );

    const totals = this.invoiceService.calculateTotalprice(
      products,
      salesOrderData.settings,
    );
    const result = await this.salesOrdersRepository.createSalesOrder({
      ...salesOrderData.settings,
      totalPrice: totals.invoiceTotal,
      userId,
    });

    await this.salesOrdersToProductsRepository.storeSalesOrderProducts(
      result.identifiers[0].id,
      products,
    );
    return {
      client,
      products,
      businessInfo,
      totals,
      invoiceData: {
        id: result.identifiers[0].id,
        date: salesOrderData.settings.date,
      },
    };
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
    const {
      client,
      products,
      businessInfo,
    } = await this.invoiceService.retrieveRelevantData(
      invoiceData,
      clientId,
      userId,
    );
    const totals = this.invoiceService.calculateTotalprice(
      products,
      invoiceData.settings,
    );

    await this.salesOrdersRepository.updateSalesOrder(
      {
        ...invoiceData.settings,
        totalPrice: totals.invoiceTotal,
        userId,
      },
      invoiceId,
    );

    await this.salesOrdersToProductsRepository.updateSalesOrderProducts(
      invoiceId,
      products,
    );

    return {
      client,
      products,
      businessInfo,
      totals,
      invoiceData: {
        id: invoiceId,
        date: invoiceData.settings.date,
      },
    };
  }
  generatePdf(data, res) {
    const docDefinition = generateSalesOrderTemplate(data);
    debugger;
    return generatePdf(docDefinition, response => {
      debugger;
      res.send(response);
    });
  }
}
