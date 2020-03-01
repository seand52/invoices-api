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

  getPopularProducts(clientId: number) {
    return this.query(`
    SELECT COUNT(quantity) as count, reference
    FROM invoice_to_products
    JOIN invoices i on invoice_to_products.invoiceId = i.id
    WHERE i.clientId = ${clientId}
    GROUP BY reference
    ORDER BY count
    DESC limit 10;
    `);
  }

  formatProducts(data) {
    return data.map(item => ({
      ...item,
      price: parseFloat(item.price),
    }));
  }
}
