import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvoicesRepository } from './invoices.repository';
import { Pagination, paginate } from 'nestjs-typeorm-paginate';
import { Invoices } from './invoices.entity';
import { ClientsRepository } from '../clients/clients.repository';
import { ProductsRepository } from '../products/products.repository';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { Products } from 'src/products/products.entity';

interface FullProductData extends Products {
  quantity: number;
}
@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(InvoicesRepository)
    private invoicesRepository: InvoicesRepository,
    @InjectRepository(ClientsRepository)
    private clientsRepository: ClientsRepository,
    @InjectRepository(ProductsRepository)
    private productsRepository: ProductsRepository,
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

  async getInvoiceById(id: number) {
    return this.invoicesRepository.retrieveInvoiceInfo(id);
  }

  async deleteInvoiceById(id: number, userId: number): Promise<string> {
    const invoice = await this.invoicesRepository.findOne(id);
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }
    if (invoice.userId !== userId) {
      throw new UnauthorizedException('You do not have permission to perform this request');
    }

    await this.invoicesRepository.delete(invoice.id);
    return 'OK';
  }

  calculateTotalprice(data: FullProductData) {}

  async saveInvoice(invoiceData: CreateInvoiceDto, userId) {
    const { clientId } = invoiceData.settings;
    const productIds = invoiceData.products.map(item => item.id);
    const [client, products] = await Promise.all([
      this.clientsRepository.findOne(clientId),
      this.productsRepository.retrieveProductDetails(productIds),
    ]);
    const fullProductData: any = products.map(product => ({
      ...product,
      quantity: invoiceData.products.find(item => item.id === product.id).quantity,
    }));

    // calculate totalPrice
    this.calculateTotalprice(fullProductData);
    // insert data

    // print PDF
  }
}
