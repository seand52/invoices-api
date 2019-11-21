import {Repository, EntityRepository, getConnection} from 'typeorm';
import { Products } from './products.entity';

@EntityRepository(Products)
export class ProductsRepository extends Repository<Products> {
  retrieveProductDetails(productIds: number[]) {
    return this.createQueryBuilder('product')
    .whereInIds(productIds)
    .getMany();
  }

}
