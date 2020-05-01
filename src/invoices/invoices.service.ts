const moment = require('moment');
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
  ForbiddenException,
  NotAcceptableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvoicesRepository } from './invoices.repository';
import { Pagination, paginate } from 'nestjs-typeorm-paginate';
import { generatePdf } from '../helpers/generate_pdf';
import { Invoices } from './invoices.entity';
import { ClientsRepository } from '../clients/clients.repository';
import { ProductsRepository } from '../products/products.repository';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceSettingsDto } from './dto/invoice-settings.dto';
import { InvoiceToProductsRepository } from '../invoice-products/invoice-products.repository';
import { FullInvoiceDetails } from './dto/output.dto';
import { SalesOrdersRepository } from '../sales-orders/sales-orders.repository';
import { BusinessInfoRepository } from '../business-info/business-info.repository';
import { generateInvoiceTemplate } from '../helpers/invoice-template';
import { SalesOrdersToProductsRepository } from '../salesOrder-products/salesOrder-products.repository';
import { SalesOrders } from 'src/sales-orders/sales-orders.entity';
import { SalesOrderToProducts } from 'src/salesOrder-products/salesOrder-products.entity';
import { InvoiceToProducts } from 'src/invoice-products/invoice-products.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(InvoicesRepository)
    private invoicesRepository: InvoicesRepository,
    @InjectRepository(ClientsRepository)
    private clientsRepository: ClientsRepository,
    @InjectRepository(ProductsRepository)
    private productsRepository: ProductsRepository,
    @InjectRepository(InvoiceToProductsRepository)
    private invoiceToProductsRepository: InvoiceToProductsRepository,
    @InjectRepository(SalesOrdersRepository)
    private salesOrderRepository: SalesOrdersRepository,
    @InjectRepository(SalesOrdersToProductsRepository)
    private salesOrdersToProductsRepository: SalesOrdersToProductsRepository,
    @InjectRepository(BusinessInfoRepository)
    private businessInfoRepository: BusinessInfoRepository,
  ) {}

  async paginateInvoices(options, userId): Promise<Pagination<Invoices>> {
    const queryBuilder = this.invoicesRepository.createQueryBuilder('invoice');
    queryBuilder
      .leftJoin('invoice.client', 'client')
      .select(['invoice', 'client.name', 'client.email', 'client.telephone1'])
      .where('invoice.userId = :userId', { userId });
    if (options.clientName !== '') {
      queryBuilder.where('client.name like :name', {
        name: '%' + options.clientName + '%',
      });
    }
    if (options.clientId !== '') {
      queryBuilder.where('client.id=:id', {
        id: options.clientId,
      });
    }
    queryBuilder.orderBy('invoice.id', 'DESC');
    const result = await paginate<Invoices>(queryBuilder, options);
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

  async getInvoiceById(id: number): Promise<FullInvoiceDetails> {
    const [invoice] = await this.invoicesRepository.retrieveInvoiceInfo(id);
    return invoice;
  }

  async deleteInvoiceById(
    id: number,
    userId: number,
  ): Promise<{ message: string }> {
    const invoice = await this.invoicesRepository.findOne(id);
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    if (invoice.userId !== userId) {
      throw new UnauthorizedException(
        'You do not have permission to perform this request',
      );
    }

    await this.invoicesRepository.delete(invoice.id);
    return { message: 'OK' };
  }

  calculateTotalprice(products, settings: InvoiceSettingsDto) {
    try {
      const subTotal = products.reduce(
        (accum, curr) =>
          accum +
          curr.price * curr.quantity * (1 - this.makeZero(curr.discount)),
        0,
      );
      const iva = subTotal * settings.tax;
      const re = subTotal * settings.re;
      const totalWithoutTransport = subTotal + iva + re;
      const transport = settings.transportPrice || 0;
      const invoiceTotal = totalWithoutTransport + transport;
      return {
        productsTotal: this.round(subTotal),
        tax: this.round(iva),
        re: this.round(re),
        subTotal: this.round(totalWithoutTransport),
        transport: this.round(transport),
        invoiceTotal: this.round(invoiceTotal),
      };
    } catch (err) {
      throw new InternalServerErrorException('Error calculating the price');
    }
  }

  async retrieveRelevantData(invoiceData, clientId, userId) {
    const [client, businessInfo] = await Promise.all([
      this.clientsRepository.findOne(clientId),
      this.businessInfoRepository.findOne({ userId }),
    ]);
    const fullProductData = invoiceData.products.map(product => {
      return {
        ...product,
        reference: product.reference,
        description: product.description,
        price: parseFloat(product.price),
        quantity: product.quantity,
        discount: this.makeZero(product.discount),
        finalPrice: this.round(
          product.quantity * parseFloat(product.price) * (1 - product.discount),
        ),
      };
    });
    return {
      products: fullProductData,
      client,
      businessInfo,
    };
  }

  async saveInvoice(invoiceData: CreateInvoiceDto, userId) {
    const { clientId } = invoiceData.settings;
    const { client, products, businessInfo } = await this.retrieveRelevantData(
      invoiceData,
      clientId,
      userId,
    );
    const totals = this.calculateTotalprice(products, invoiceData.settings);
    const result = await this.invoicesRepository.createInvoice({
      ...invoiceData.settings,
      totalPrice: totals.invoiceTotal,
      userId,
    });
    await this.invoiceToProductsRepository.storeInvoiceProducts(
      result.identifiers[0].id,
      products,
    );

    if (invoiceData.settings.transportPrice > 0) {
      /*
      Automatically make a separate transport only invoice
      if the OG invoice has a transport cost due to client request
      */
      await this.invoicesRepository.createInvoice({
        clientId: client.id,
        date: invoiceData.settings.date,
        paymentType: invoiceData.settings.paymentType,
        transportPrice: invoiceData.settings.transportPrice,
        userId,
        totalPrice: invoiceData.settings.transportPrice,
      });
    }
    return {
      client,
      products,
      businessInfo,
      totals,
      invoiceData: {
        date: moment(invoiceData.settings.date).format('DD-MM-YYYY'),
        id: result.identifiers[0].id,
        paymentType: invoiceData.settings.paymentType,
      },
    };
  }

  async updateInvoice(invoiceData: CreateInvoiceDto, invoiceId, userId) {
    const { clientId } = invoiceData.settings;
    const invoice = await this.invoicesRepository.findOne(invoiceId);
    if (!invoice) {
      throw new NotFoundException(
        'Could not find the invoice you are trying to edit',
      );
    }
    if (invoice.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to modify this invoice',
      );
    }
    const { client, products, businessInfo } = await this.retrieveRelevantData(
      invoiceData,
      clientId,
      userId,
    );
    const totals = this.calculateTotalprice(products, invoiceData.settings);

    await this.invoicesRepository.updateInvoice(
      {
        ...invoiceData.settings,
        totalPrice: totals.invoiceTotal,
        userId,
      },
      invoiceId,
    );

    if (invoiceData.products.length) {
      await this.invoiceToProductsRepository.updateInvoiceProducts(
        invoiceId,
        products,
      );
    }
    return {
      client,
      products,
      businessInfo,
      totals,
      invoiceData: {
        date: moment(invoiceData.settings.date).format('DD-MM-YYYY'),
        id: invoiceId,
        paymentType: invoiceData.settings.paymentType,
      },
    };
  }

  async transformToInvoice(userId, salesOrderId) {
    const salesOrder = await this.salesOrderRepository.findOne(salesOrderId);
    const salesOrderProducts = await this.salesOrdersToProductsRepository.retrieveSalesOrderProducts(
      salesOrderId,
    );

    if (!salesOrder) {
      throw new NotFoundException(
        'Not able to find the sales order you are trying to convert',
      );
    }

    if (salesOrder.expired === 1) {
      throw new NotAcceptableException(
        'This sales order has already been converted',
      );
    }

    if (!salesOrderProducts.length) {
      throw new NotAcceptableException(
        'This is a transport invoice. Make sure you transform the original invoice',
      );
    }

    const invoiceData = this.createInvoiceData(salesOrder, salesOrderProducts);
    invoiceData.settings.date = moment().format('YYYY-MM-DD');
    try {
      const data = await this.saveInvoice(invoiceData, userId);
      await this.salesOrderRepository.update(salesOrder.id, { expired: 1 });
      return data;
    } catch (err) {
      throw new InternalServerErrorException(
        'There was a problem saving your invoice',
      );
    }
  }

  generatePdf(data, res) {
    const docDefinition = generateInvoiceTemplate(data);
    return generatePdf(docDefinition, response => {
      const responseObject = {
        base64: response,
        id: data.invoiceData.id,
      };
      res.send(responseObject);
    });
  }

  round(num: number) {
    return Math.round(num * 100) / 100;
  }

  makeZero(num: number) {
    return isNaN(num) ? 0 : num;
  }

  createInvoiceData(
    data: SalesOrders,
    products: Array<SalesOrderToProducts | InvoiceToProducts>,
  ): CreateInvoiceDto {
    return {
      settings: {
        clientId: data.clientId,
        date: data.date,
        // @ts-ignore
        re: parseFloat(data.re),
        // @ts-ignore
        transportPrice: parseFloat(data.transportPrice),
        paymentType: data.paymentType,
        // @ts-ignore
        tax: parseFloat(data.tax),
      },
      products: products.map(product => ({
        quantity: product.quantity,
        discount: product.discount,
        price: product.price,
        reference: product.reference,
        description: product.description,
      })),
    };
  }

  async retrieveInfo(id) {
    const [invoice] = await this.invoicesRepository.retrieveInvoiceInfo(id);
    if (!invoice) {
      throw new NotFoundException(
        'The invoice you are trying to generate does not exist',
      );
    }
    const [client, businessInfo] = await Promise.all([
      this.clientsRepository.findOne(invoice.clientId),
      this.businessInfoRepository.findOne({ userId: invoice.userId }),
    ]);
    const data = this.createInvoiceData(invoice, invoice.invoiceToProducts);
    const totals = this.calculateTotalprice(data.products, data.settings);
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
        id: invoice.id,
        paymentType: invoice.paymentType,
      },
    };
  }
}
