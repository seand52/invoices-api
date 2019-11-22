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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { Products } from './products.entity';
import { Pagination } from 'nestjs-typeorm-paginate';

@Controller('products')
@UseGuards(AuthGuard('jwt'))
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  async getProducts(
    @Query('page') page: number = 0,
    @Query('limit') limit: number = 10,
    @Request() req: any,
  ): Promise<Pagination<Products>> {
    const { userId } = req.user;
    limit = limit > 100 ? 100 : limit;
    return await this.productsService.paginateProducts(
      { page, limit, route: 'http://localhost:3000/api/products' },
      userId,
    );
  }

  @Get(':id')
  async getProduct(@Param('id', ParseIntPipe) id: number): Promise<Products> {
    return this.productsService.getProductById(id);
  }

  @Post()
  @UsePipes(ValidationPipe)
  async createProduct(
    @Body() productData: CreateProductDto,
    @Request() req: any,
  ): Promise<Products> {
    const { userId } = req.user;
    const productId = await this.productsService.createProduct(
      productData,
      userId,
    );
    return this.productsService.getProductById(productId);
  }

  @Delete(':id')
  async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<string> {
    const { userId } = req.user;
    return this.productsService.deleteProductById(id, userId);
  }

  @Patch(':id')
  @UsePipes(ValidationPipe)
  async updateProduct(
    @Param('id', ParseIntPipe) productId: number,
    @Body() productData: UpdateProductDto,
    @Request() req: any,
  ): Promise<Products> {
    const { userId } = req.user;
    return this.productsService.updateProductById(
      productData,
      productId,
      userId,
    );
  }
}
