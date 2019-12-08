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

@Controller('sales-orders')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(ClassSerializerInterceptor)
export class SalesOrdersController {
  constructor(
    private salesOrdersService: SalesOrdersService,
    private invoiceService: InvoicesService,
  ) {}

  @Get()
  async getSalesOrders(
    @Query('page') page: number = 0,
    @Query('limit') limit: number = 10,
    @Request() req: any,
  ) {
    const { userId } = req.user;
    limit = limit > 100 ? 100 : limit;
    const salesOrders = await this.salesOrdersService.paginatesalesOrders(
      { page, limit, route: 'http://localhost:3000/api/sales-orders' },
      userId,
    );
    return { ...salesOrders, currentPage: Number(page) };
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
    debugger;
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
    return this.invoiceService.generatePdf(response, res);
  }
}
