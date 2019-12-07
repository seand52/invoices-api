import {
  Controller,
  Post,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Request,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Delete,
  Patch,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { AuthGuard } from '@nestjs/passport';
import { Clients } from './clients.entity';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientInvoices } from './dto/client-invoices.dto';

@Controller('clients')
@UseGuards(AuthGuard('jwt'))
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  async getClients(
    @Query('page') page: number = 0,
    @Query('limit') limit: number = 10,
    @Request() req: any,
  ) {
    const { userId } = req.user;
    limit = limit > 100 ? 100 : limit;
    const clients = await this.clientsService.paginateClients(
      { page, limit, route: 'http://localhost:3000/api/clients' },
      userId,
    );
    return { ...clients, currentPage: Number(page) };
  }

  @Get('search')
  async searchClient(@Query('name') name: string = ''): Promise<Clients[]> {
    return this.clientsService.searchClients(name);
  }

  @Get(':id')
  async getClient(@Param('id', ParseIntPipe) id: number): Promise<Clients> {
    return this.clientsService.getClientById(id);
  }

  @Get(':clientId/invoices')
  async getClientInvoices(
    @Param('clientId', ParseIntPipe) clientId: number,
  ): Promise<ClientInvoices[]> {
    return this.clientsService.getClientInvoices(clientId);
  }

  @Post()
  @UsePipes(ValidationPipe)
  async createClient(
    @Body() clientData: CreateClientDto,
    @Request() req: any,
  ): Promise<Clients> {
    const { userId } = req.user;
    const clientId = await this.clientsService.createClient(clientData, userId);
    return this.clientsService.getClientById(clientId);
  }

  @Delete(':id')
  async deleteClient(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<{ message: string }> {
    const { userId } = req.user;
    return this.clientsService.deleteClientById(id, userId);
  }

  @Patch(':id')
  @UsePipes(ValidationPipe)
  async updateClient(
    @Param('id', ParseIntPipe) clientId: number,
    @Body() clientData: UpdateClientDto,
    @Request() req: any,
  ): Promise<Clients> {
    const { userId } = req.user;
    return this.clientsService.updateClientById(clientData, clientId, userId);
  }
}
