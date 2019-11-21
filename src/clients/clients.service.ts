import { Injectable, ConflictException, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientsRepository } from './clients.repository';
import { CreateClientDto } from './dto/create-client.dto';
import { Clients } from './clients.entity';
import { UpdateClientDto } from './dto/update-client.dto';
import { InvoicesRepository } from '../invoices/invoices.repository';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(ClientsRepository)
    private clientsRepository: ClientsRepository,
    @InjectRepository(InvoicesRepository)
    private invoicesRepository: InvoicesRepository,
  ) {}

  async getClientById(id: number): Promise<Clients> {
    const client = await this.clientsRepository.findOne(id);

    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return client;
  }

  async paginateClients(options, userId): Promise<Pagination<Clients>> {
    const queryBuilder = this.clientsRepository.createQueryBuilder('client');
    queryBuilder.where('client.userId = :userId', { userId }).orderBy('client.name', 'DESC');
    return paginate<Clients>(queryBuilder, options);
  }

  async createClient(clientData: CreateClientDto, userId) {
    try {
      const client = await this.clientsRepository.insert({...clientData, userId});
      return client.identifiers[0].id;
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('DUPLICATE_CLIENT');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async deleteClientById(id: number, userId: number): Promise<string> {
    const client = await this.clientsRepository.findOne(id);
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    if (client.userId !== userId ) {
      throw new UnauthorizedException('You do not have permission to perform this request');
    }
    await this.clientsRepository.delete(client.id);
    return 'OK';
  }

  async updateClientById(clientData: UpdateClientDto, clientId, userId: number): Promise<string> {
    const client = await this.clientsRepository.findOne(clientId);
    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    if (client.userId !== userId ) {
      throw new UnauthorizedException('You do not have permission to perform this request');
    }
    await this.clientsRepository.update(client.id, clientData);
    return 'OK';
  }

  async getClientInvoices(clientId: number) {
    const invoices = await this.invoicesRepository.findClientInvoices(clientId);
    return invoices;
  }
}
