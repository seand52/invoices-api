import { Repository, EntityRepository } from 'typeorm';
import { SalesOrderToProducts } from './salesOrder-products.entity';

@EntityRepository(SalesOrderToProducts)
export class SalesOrdersToProductsRepository extends Repository<
  SalesOrderToProducts
> {
  async storeSalesOrderProducts(salesOrderId, products) {
    const productsToStore = this.prepareForStore(salesOrderId, products);
    return this.createQueryBuilder()
      .insert()
      .into(SalesOrderToProducts)
      .values(productsToStore)
      .execute();
  }

  async updateSalesOrderProducts(salesOrderId, products) {
    await this.createQueryBuilder()
      .delete()
      .from(SalesOrderToProducts)
      .where('salesOrderId = :salesOrderId', { salesOrderId })
      .execute();
    return this.storeSalesOrderProducts(salesOrderId, products);
  }

  async retrieveSalesOrderProducts(salesOrderId) {
    return this.createQueryBuilder('salesOrderProduct')
      .where('salesOrderProduct.salesOrderId=:salesOrderId', { salesOrderId })
      .select([
        'salesOrderProduct.quantity',
        'salesOrderProduct.discount',
        'salesOrderProduct.price',
        'salesOrderProduct.reference',
        'salesOrderProduct.description',
      ])
      .getMany();
  }

  prepareForStore(salesOrderId, products) {
    return products.map(product => ({
      salesOrderId,
      productId: product.id,
      quantity: product.quantity,
      discount: product.discount,
      price: product.price,
      reference: product.reference,
      description: product.description,
    }));
  }
}
