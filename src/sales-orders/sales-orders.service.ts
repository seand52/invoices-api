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
import { BusinessInfoRepository } from '../business-info/business-info.repository';
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
    @InjectRepository(BusinessInfoRepository)
    private businessInfoRepository: BusinessInfoRepository,
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
        isTransport: item.transportPrice === item.totalPrice,
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

    if (salesOrderData.settings.transportPrice > 0) {
      /*
      Automatically make a separate transport only invoice
      if the OG invoice has a transport cost due to client request
      */
      await this.salesOrdersRepository.createSalesOrder({
        clientId: client.id,
        date: salesOrderData.settings.date,
        paymentType: salesOrderData.settings.paymentType,
        transportPrice: salesOrderData.settings.transportPrice,
        userId,
        totalPrice: salesOrderData.settings.transportPrice,
      });
    }
    return {
      client,
      products,
      businessInfo,
      totals,
      invoiceData: {
        paymentType: salesOrderData.settings.paymentType,
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

    if (salesOrderData.products.length) {
      await this.salesOrdersToProductsRepository.updateSalesOrderProducts(
        salesOrderId,
        products,
      );
    }
    return {
      client,
      products,
      businessInfo,
      totals,
      invoiceData: {
        id: salesOrderId,
        paymentType: salesOrderData.settings.paymentType,
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
      const responseObject = {
        base64: response,
        id: data.invoiceData.id,
      };
      res.send(responseObject);
    });
  }

  async retrieveInfo(id) {
    const [invoice] = await this.salesOrdersRepository.retrieveInvoiceInfo(id);
    if (!invoice) {
      throw new NotFoundException(
        'The sales order you are trying to generate does not exist',
      );
    }
    const [client, businessInfo] = await Promise.all([
      this.clientsRepository.findOne(invoice.clientId),
      this.businessInfoRepository.findOne({ userId: invoice.userId }),
    ]);
    const data = this.invoiceService.createInvoiceData(
      invoice,
      invoice.salesOrderToProducts,
    );
    const totals = this.invoiceService.calculateTotalprice(
      data.products,
      data.settings,
    );
    return {
      client,
      products: data.products.map(item => ({
        ...item,
        // @ts-ignore
        price: parseFloat(item.price),
        // @ts-ignore
        discount: parseFloat(item.discount),
        finalPrice: this.round(
          // @ts-ignore
          item.quantity * parseFloat(item.price) * (1 - item.discount),
        ),
      })),
      businessInfo,
      totals,
      invoiceData: {
        date: moment(data.settings.date).format('DD-MM-YYYY'),
        expirationDate: invoice.expirationDate
          ? moment(invoice.expirationDate).format('DD-MM-YYYY')
          : null,
        id: invoice.id,
        paymentType: invoice.paymentType,
      },
    };
  }

  round(num: number) {
    return Math.round(num * 100) / 100;
  }
}
