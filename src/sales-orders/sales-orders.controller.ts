import {
  Controller,
  Post,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Request,
  Response,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Delete,
  Patch,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { AuthGuard } from '@nestjs/passport';
import { SalesOrders } from './sales-orders.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { FullSalesOrdersDetails } from './dto/output.dto';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { InvoicesService } from '../invoices/invoices.service';
import { ConfigService } from '../config/config.service';

@Controller('sales-orders')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(ClassSerializerInterceptor)
export class SalesOrdersController {
  constructor(
    private salesOrdersService: SalesOrdersService,
    private invoiceService: InvoicesService,
    private configService: ConfigService,
  ) {}

  @Get()
  async getSalesOrders(
    @Query('page') page: number = 0,
    @Query('limit') limit: number = 10,
    @Query('clientName') clientName: string = '',
    @Query('clientId') clientId: string = '',
    @Request() req: any,
  ) {
    const { userId } = req.user;
    limit = limit > 100 ? 100 : limit;
    const salesOrders = await this.salesOrdersService.paginatesalesOrders(
      {
        page,
        limit,
        clientName,
        clientId,
        route: `${this.configService.get('API_URL')}/sales-orders`,
      },
      userId,
    );
    return {
      ...salesOrders,
      currentPage: Number(page),
      rowsPerPage: Number(limit),
    };
  }

  @Get(':id')
  async getSalesOrder(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FullSalesOrdersDetails> {
    return this.salesOrdersService.getSalesOrderById(id);
  }

  @Delete(':id')
  async deleteSalesOrder(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<{ message: string }> {
    const { userId } = req.user;
    return this.salesOrdersService.deleteSalesOrderById(id, userId);
  }

  @Post()
  @UsePipes(ValidationPipe)
  async createInvoice(
    @Body() salesOrderData: CreateSalesOrderDto,
    @Request() req: any,
    @Response() res: any,
  ) {
    const { userId } = req.user;
    const response = await this.salesOrdersService.saveSalesOrder(
      salesOrderData,
      userId,
    );
    return this.salesOrdersService.generatePdf(response, res);
  }

  @Patch(':id')
  @UsePipes(ValidationPipe)
  async updateSalesOrder(
    @Param('id', ParseIntPipe) invoiceId: number,
    @Body() invoiceData: CreateSalesOrderDto,
    @Request() req: any,
    @Response() res: any,
  ) {
    const { userId } = req.user;
    const response = await this.salesOrdersService.updateSalesOrder(
      invoiceData,
      invoiceId,
      userId,
    );
    return this.salesOrdersService.generatePdf(response, res);
  }

  @Get('pdf/:id')
  async generateSalesOrderPdf(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Response() res: any,
  ) {
    const data = await this.salesOrdersService.retrieveInfo(id);
    return this.salesOrdersService.generatePdf(data, res);
  }
}
