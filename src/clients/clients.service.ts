import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientsRepository } from './clients.repository';
import { CreateClientDto } from './dto/create-client.dto';
import { Clients } from './clients.entity';
import { UpdateClientDto } from './dto/update-client.dto';
import { InvoicesRepository } from '../invoices/invoices.repository';
import { ClientInvoices, SpendDataResponse } from './dto/client-invoices.dto';
import { SalesOrdersRepository } from '../sales-orders/sales-orders.repository';
import { ProductsRepository } from '../products/products.repository';
import { initialBarChartData } from '../helpers/chartData';
const moment = require('moment');

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(ClientsRepository)
    private clientsRepository: ClientsRepository,
    @InjectRepository(InvoicesRepository)
    private invoicesRepository: InvoicesRepository,
    @InjectRepository(SalesOrdersRepository)
    private salesOrdersRepository: SalesOrdersRepository,
    @InjectRepository(ProductsRepository)
    private productsRepository: ProductsRepository,
  ) {}

  async getClientById(id: number): Promise<Clients> {
    const client = await this.clientsRepository.findOne(id);

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return client;
  }

  async searchClients(name: string): Promise<Clients[]> {
    if (!name.trim().length) {
      throw new BadRequestException();
    }
    return this.clientsRepository.searchClientsByName(name);
  }

  async paginateClients(options, userId): Promise<Pagination<Clients>> {
    const queryBuilder = this.clientsRepository.createQueryBuilder('client');
    queryBuilder
      .where('client.userId = :userId', { userId })
      .orderBy('client.name', 'ASC');

    if (options.name !== '') {
      queryBuilder.where('client.name like :name', {
        name: '%' + options.name + '%',
      });
    }

    return paginate<Clients>(queryBuilder, options);
  }

  async createClient(clientData: CreateClientDto, userId) {
    try {
      const client = await this.clientsRepository.insert({
        ...clientData,
        userId,
      });
      return client.identifiers[0].id;
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          'Sorry, there is already a client with this email address!',
        );
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async deleteClientById(
    id: number,
    userId: number,
  ): Promise<{ message: string }> {
    const client = await this.clientsRepository.findOne(id);
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    if (client.userId !== userId) {
      throw new UnauthorizedException(
        'You do not have permission to perform this request',
      );
    }
    await this.clientsRepository.delete(client.id);
    return { message: 'OK' };
  }

  async updateClientById(
    clientData: UpdateClientDto,
    clientId,
    userId: number,
  ): Promise<Clients> {
    const client = await this.clientsRepository.findOne(clientId);
    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    if (client.userId !== userId) {
      throw new UnauthorizedException(
        'You do not have permission to perform this request',
      );
    }
    await this.clientsRepository.update(client.id, clientData);
    return this.clientsRepository.findOne(clientId);
  }

  async getClientInvoices(clientId: number): Promise<ClientInvoices[]> {
    const invoices = await this.invoicesRepository.findClientInvoices(clientId);
    return invoices;
  }
  async getClientSalesOrders(clientId: number): Promise<ClientInvoices[]> {
    const invoices = await this.salesOrdersRepository.findClientSalesOrders(
      clientId,
    );
    return invoices;
  }

  async getTotalSpend(clientId: number): Promise<SpendDataResponse> {
    const invoices = await this.invoicesRepository.findClientInvoices(clientId);
    return this.makeBarChartData(invoices);
  }

  makeBarChartData(invoices): SpendDataResponse {
    const obj = { TOTAL: initialBarChartData.map(a => ({ ...a })) };
    invoices.forEach(item => {
      const year = moment(item.date).year();
      const month = moment(item.date).format('MMMM');
      const monthObjIndex = initialBarChartData.findIndex(
        _item => _item.name === month,
      );
      if (!obj.hasOwnProperty(year)) {
        obj[year] = initialBarChartData.map(a => ({ ...a }));
      }
      obj[year][monthObjIndex].spend =
        Math.round((obj[year][monthObjIndex].spend + item.totalPrice) * 100) /
        100;
      obj.TOTAL[monthObjIndex].spend =
        Math.round((obj.TOTAL[monthObjIndex].spend + item.totalPrice) * 100) /
        100;
    });
    return obj;
  }

  async getPopularProducts(clientId: number) {
    const products = await this.productsRepository.getPopularProducts(clientId);
    const maxCount = Math.max(...products.map(item => item.count));
    return products.map(item => ({
      reference: item.reference,
      fullMark: maxCount,
      '# of items sold': item.count,
    }));
  }
}
