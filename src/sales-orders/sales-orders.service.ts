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
const moment = require('moment');

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
    queryBuilder.orderBy('sales_order.id', 'DESC');
    const result = await paginate<SalesOrders>(queryBuilder, options);
    return {
      ...result,
      // @ts-ignore
      items: result.items.map(item => ({
        ...item,
        date: item.formatDate(item.date),
      })),
    };
  }

  async getSalesOrderById(id: number): Promise<FullSalesOrdersDetails> {
    const [invoice] = await this.salesOrdersRepository.retrieveInvoiceInfo(id);
    // rename property for frontend. ideally should be using an alias in query
    invoice.invoiceToProducts = [...invoice.salesOrderToProducts];
    delete invoice.salesOrderToProducts;
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
    debugger;
    return {
      client,
      products,
      businessInfo,
      totals,
      invoiceData: {
        id: result.identifiers[0].id,
        date: moment(salesOrderData.settings.date).format('DD-MM-YYYY'),
        expirationDate: salesOrderData.settings.expirationDate
          ? moment(salesOrderData.settings.expirationDate).format('DD-MM-YYYY')
          : null,
      },
    };
  }

  async updateSalesOrder(
    salesOrderData: CreateSalesOrderDto,
    salesOrderId,
    userId,
  ) {
    const { clientId } = salesOrderData.settings;
    const salesOrder = await this.salesOrdersRepository.findOne(salesOrderId);
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
      salesOrderData,
      clientId,
      userId,
    );
    debugger;
    const totals = this.invoiceService.calculateTotalprice(
      products,
      salesOrderData.settings,
    );

    await this.salesOrdersRepository.updateSalesOrder(
      {
        ...salesOrderData.settings,
        totalPrice: totals.invoiceTotal,
        userId,
      },
      salesOrderId,
    );

    await this.salesOrdersToProductsRepository.updateSalesOrderProducts(
      salesOrderId,
      products,
    );

    return {
      client,
      products,
      businessInfo,
      totals,
      invoiceData: {
        id: salesOrderId,
        date: moment(salesOrderData.settings.date).format('DD-MM-YYYY'),
        expirationDate: salesOrderData.settings.expirationDate
          ? moment(salesOrderData.settings.expirationDate).format('DD-MM-YYYY')
          : null,
      },
    };
  }
  generatePdf(data, res) {
    const docDefinition = generateSalesOrderTemplate(data);
    return generatePdf(docDefinition, response => {
      res.send(response);
    });
  }
}
