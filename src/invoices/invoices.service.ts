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
import { Invoices } from './invoices.entity';
import { ClientsRepository } from '../clients/clients.repository';
import { ProductsRepository } from '../products/products.repository';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceSettingsDto } from './dto/invoice-settings.dto';
import { InvoiceToProductsRepository } from '../invoice-products/invoice-products.repository';
import { FullInvoiceDetails } from './dto/output.dto';

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
      return Math.round(invoiceTotal * 100) / 100;
    } catch (err) {
      throw new InternalServerErrorException('Error calculating the price');
    }
  }

  async retrieveRelevantData(invoiceData, clientId) {
    const productIds = invoiceData.products.map(item => item.id);
    const [client, products] = await Promise.all([
      this.clientsRepository.findOne(clientId),
      this.productsRepository.retrieveProductDetails(productIds),
    ]);
    const fullProductData = products.map(product => ({
      ...product,
      quantity: invoiceData.products.find(item => item.id === product.id)
        .quantity,
    }));
    return {
      products: fullProductData,
      client,
    };
  }

  async saveInvoice(invoiceData: CreateInvoiceDto, userId) {
    const { clientId } = invoiceData.settings;
    const { client, products } = await this.retrieveRelevantData(
      invoiceData,
      clientId,
    );

    const totalPrice = this.calculateTotalprice(products, invoiceData.settings);

    const result = await this.invoicesRepository.createInvoice({
      ...invoiceData.settings,
      totalPrice,
      userId,
    });

    await this.invoiceToProductsRepository.storeInvoiceProducts(
      result.identifiers[0].id,
      products,
    );
    return 'OK';
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
    const { client, products } = await this.retrieveRelevantData(
      invoiceData,
      clientId,
    );
    const totalPrice = this.calculateTotalprice(products, invoiceData.settings);

    await this.invoicesRepository.updateInvoice(
      {
        ...invoiceData.settings,
        totalPrice,
        userId,
      },
      invoiceId,
    );

    await this.invoiceToProductsRepository.updateInvoiceProducts(
      invoiceId,
      products,
    );
  }
}
