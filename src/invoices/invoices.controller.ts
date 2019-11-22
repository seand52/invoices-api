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
import { InvoicesService } from './invoices.service';
import { AuthGuard } from '@nestjs/passport';
import { Invoices } from './invoices.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Controller('invoices')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(ClassSerializerInterceptor)
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get()
  async getInvoices(
    @Query('page') page: number = 0,
    @Query('limit') limit: number = 10,
    @Request() req: any,
  ): Promise<Pagination<Invoices>> {
    const { userId } = req.user;
    limit = limit > 100 ? 100 : limit;
    return await this.invoicesService.paginateInvoices(
      { page, limit, route: 'http://localhost:3000/api/invoices' },
      userId,
    );
  }

  @Get(':id')
  async getInvoice(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.invoicesService.getInvoiceById(id);
  }

  @Delete(':id')
  async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<string> {
    const { userId } = req.user;
    return this.invoicesService.deleteInvoiceById(id, userId);
  }

  @Post()
  @UsePipes(ValidationPipe)
  async createInvoice(
    @Body() invoiceData: CreateInvoiceDto,
    @Request() req: any,
  ) {
    const { userId } = req.user;
    await this.invoicesService.saveInvoice(invoiceData, userId);
  }

  @Patch(':id')
  @UsePipes(ValidationPipe)
  async updateInvoice(
    @Param('id', ParseIntPipe) invoiceId: number,
    @Body() invoiceData: CreateInvoiceDto,
    @Request() req: any,
  ) {
    const { userId } = req.user;
    await this.invoicesService.updateInvoice(invoiceData, invoiceId, userId);
  }
}
