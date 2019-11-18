import { Injectable, ConflictException, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { paginate, Pagination } from 'nestjs-typeorm-paginate';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductsRepository } from './products.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Products } from './products.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductsRepository)
    private productsRepository: ProductsRepository,
  ) {}

  async getProductById(id: number): Promise<Products> {
    const product = await this.productsRepository.findOne(id);

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async paginateProducts(options, userId): Promise<Pagination<Products>> {
    const queryBuilder = this.productsRepository.createQueryBuilder('product');
    queryBuilder.where('product.userId = :userId', { userId });
    return paginate<Products>(queryBuilder, options);
  }

  async createProduct(productData: CreateProductDto, userId) {
    try {
      const product = await this.productsRepository.insert({...productData, userId});
      return product.identifiers[0].id;
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('DUPLICATE_PRODUCT');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async deleteProductById(id: number, userId: number): Promise<string> {
    const product = await this.productsRepository.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    if (product.userId !== userId ) {
      throw new UnauthorizedException('You do not have permission to perform this request');
    }
    await this.productsRepository.delete(product.id);
    return 'OK';
  }

  async updateProductById(productData: UpdateProductDto, productId, userId: number): Promise<string> {
    const product = await this.productsRepository.findOne(productId);
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    if (product.userId !== userId ) {
      throw new UnauthorizedException('You do not have permission to perform this request');
    }
    await this.productsRepository.update(product.id, productData);
    return 'OK';
  }
}
