import { Repository, EntityRepository, getConnection } from 'typeorm';
import { InvoiceToProducts } from './invoice-products.entity';

@EntityRepository(InvoiceToProducts)
export class InvoiceToProductsRepository extends Repository<InvoiceToProducts> {
  storeInvoiceProducts(invoiceId, products) {
    const productsToStore = this.prepareForStore(invoiceId, products);
    return this.createQueryBuilder()
      .insert()
      .into(InvoiceToProducts)
      .values(productsToStore)
      .execute();
  }

  async updateInvoiceProducts(invoiceId, products) {
    await this.createQueryBuilder()
      .delete()
      .from(InvoiceToProducts)
      .where('invoiceId = :invoiceId', { invoiceId })
      .execute();
    return this.storeInvoiceProducts(invoiceId, products);
  }

  prepareForStore(invoiceId, products) {
    return products.map(product => ({
      invoiceId,
      productId: product.id,
      quantity: product.quantity,
      discount: product.discount,
      price: product.price,
    }));
  }
}
