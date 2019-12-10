import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Request,
  Response,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { FullInvoiceDetails } from './dto/output.dto';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(ClassSerializerInterceptor)
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get()
  async getInvoices(
    @Query('page') page: number = 0,
    @Query('limit') limit: number = 10,
    @Query('clientName') clientName: string = '',
    @Request() req: any,
  ) {
    const { userId } = req.user;
    limit = limit > 100 ? 100 : limit;
    const invoices = await this.invoicesService.paginateInvoices(
      { page, limit, clientName, route: 'http://localhost:3000/api/invoices' },
      userId,
    );
    return { ...invoices, currentPage: Number(page) };
  }

  @Get(':id')
  async getInvoice(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<FullInvoiceDetails> {
    return this.invoicesService.getInvoiceById(id);
  }

  @Delete(':id')
  async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<{ message: string }> {
    const { userId } = req.user;
    return this.invoicesService.deleteInvoiceById(id, userId);
  }

  @Post()
  @UsePipes(ValidationPipe)
  async createInvoice(
    @Body() invoiceData: CreateInvoiceDto,
    @Request() req: any,
    @Response() res: any,
  ) {
    const { userId } = req.user;
    const response = await this.invoicesService.saveInvoice(
      invoiceData,
      userId,
    );
    return this.invoicesService.generatePdf(response, res);
  }

  @Put('transform-sales-order/:salesOrderId')
  async transformSalesOrder(
    @Param('salesOrderId', ParseIntPipe) salesOrderId: number,
    @Request() req: any,
    @Response() res: any,
  ) {
    const { userId } = req.user;
    const response = await this.invoicesService.transformToInvoice(
      userId,
      salesOrderId,
    );

    return this.invoicesService.generatePdf(response, res);
  }

  @Patch(':id')
  @UsePipes(ValidationPipe)
  async updateInvoice(
    @Param('id', ParseIntPipe) invoiceId: number,
    @Body() invoiceData: CreateInvoiceDto,
    @Request() req: any,
    @Response() res: any,
  ) {
    const { userId } = req.user;
    const response = await this.invoicesService.updateInvoice(
      invoiceData,
      invoiceId,
      userId,
    );
    return this.invoicesService.generatePdf(response, res);
  }
}
