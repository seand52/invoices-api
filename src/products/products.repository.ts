import { Repository, EntityRepository, getConnection } from 'typeorm';
import { Products } from './products.entity';

@EntityRepository(Products)
export class ProductsRepository extends Repository<Products> {
  async retrieveProductDetails(productIds: number[]) {
    const products = await this.createQueryBuilder('product')
      .whereInIds(productIds)
      .getMany();
    return this.formatProducts(products);
  }

  formatProducts(data) {
    return data.map(item => ({
      ...item,
      price: parseFloat(item.price),
    }));
  }
}
