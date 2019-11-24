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
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { AuthGuard } from '@nestjs/passport';
import { SalesOrders } from './sales-orders.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { FullSalesOrdersDetails } from './dto/output.dto';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';

@Controller('sales-orders')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(ClassSerializerInterceptor)
export class SalesOrdersController {
  constructor(private salesOrdersService: SalesOrdersService) {}

  @Get()
  async getSalesOrders(
    @Query('page') page: number = 0,
    @Query('limit') limit: number = 10,
    @Request() req: any,
  ): Promise<Pagination<SalesOrders>> {
    const { userId } = req.user;
    limit = limit > 100 ? 100 : limit;
    return await this.salesOrdersService.paginatesalesOrders(
      { page, limit, route: 'http://localhost:3000/api/sales-orders' },
      userId,
    );
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
  ) {
    const { userId } = req.user;
    await this.salesOrdersService.saveSalesOrder(salesOrderData, userId);
  }

  @Patch(':id')
  @UsePipes(ValidationPipe)
  async updateSalesOrder(
    @Param('id', ParseIntPipe) invoiceId: number,
    @Body() invoiceData: CreateSalesOrderDto,
    @Request() req: any,
  ) {
    const { userId } = req.user;
    await this.salesOrdersService.updateSalesOrder(
      invoiceData,
      invoiceId,
      userId,
    );
  }
}