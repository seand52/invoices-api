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

@Controller('sales-orders')
export class SalesOrdersController {
}
