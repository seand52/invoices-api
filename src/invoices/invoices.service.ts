import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
  ForbiddenException,
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
    @InjectRepository(BusinessInfoRepository)
    private businessInfoRepository: BusinessInfoRepository,
  ) {}

  async paginateInvoices(options, userId): Promise<Pagination<Invoices>> {
    const queryBuilder = this.invoicesRepository.createQueryBuilder('invoice');
    queryBuilder
      .leftJoin('invoice.client', 'client')
      .select(['invoice', 'client.name', 'client.email', 'client.telephone1'])
      .where('invoice.userId = :userId', { userId })
      .getMany();
    return paginate<Invoices>(queryBuilder, options);
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
        (accum, curr) => accum + curr.price * curr.quantity,
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
    const productIds = invoiceData.products.map(item => item.id);
    const [client, products, businessInfo] = await Promise.all([
      this.clientsRepository.findOne(clientId),
      this.productsRepository.retrieveProductDetails(productIds),
      this.businessInfoRepository.findOne({ userId }),
    ]);
    const fullProductData = products.map(product => ({
      ...product,
      quantity: invoiceData.products.find(item => item.id === product.id)
        .quantity,
    }));
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

    return {
      client,
      products,
      businessInfo,
      totals,
      invoiceData: {
        date: invoiceData.settings.date,
        id: result.identifiers[0].id,
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

    await this.invoiceToProductsRepository.updateInvoiceProducts(
      invoiceId,
      products,
    );
    return {
      client,
      products,
      businessInfo,
      totals,
      invoiceData: {
        date: invoiceData.settings.date,
        id: invoiceId,
      },
    };
  }

  async transformToInvoice(
    invoiceData: CreateInvoiceDto,
    userId,
    salesOrderId,
  ) {
    const salesOrder = await this.salesOrderRepository.findOne(salesOrderId);

    if (!salesOrder) {
      throw new NotFoundException(
        'Not able to find the sales order you are trying to convert',
      );
    }
    try {
      await this.saveInvoice(invoiceData, userId);
    } catch (err) {
      throw new InternalServerErrorException(
        'There was a problem saving your invoice',
      );
    }
    await this.salesOrderRepository.delete(salesOrderId);
    return 'OK';
  }

  generatePdf(data, res) {
    const docDefinition = generateInvoiceTemplate(data);
    return generatePdf(docDefinition, response => {
      res.send(response);
    });
  }

  round(num: number) {
    return Math.round(num * 100) / 100;
  }
}
