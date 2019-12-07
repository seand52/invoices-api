import { Repository, EntityRepository, getConnection } from 'typeorm';
import { SalesOrders } from './sales-orders.entity';

@EntityRepository(SalesOrders)
export class SalesOrdersRepository extends Repository<SalesOrders> {
  async retrieveInvoiceInfo(id) {
    const salesOrder = await this.createQueryBuilder('sales_order')
      .leftJoin('sales_order.client', 'client')
      .leftJoin('sales_order.salesOrderToProducts', 'itp')
      .leftJoin('itp.product', 'product')
      .select([
        'sales_order',
        'itp',
        'client.name',
        'product',
        'client.email',
        'client.telephone1',
      ])
      .where('sales_order.id = :id', { id })
      .getMany();
    return this.formatSalesOrders(salesOrder);
  }

  createSalesOrder(settingsData) {
    return this.createQueryBuilder()
      .insert()
      .into(SalesOrders)
      .values(settingsData)
      .execute();
  }

  updateSalesOrder(settingsData, salesOrderId) {
    return this.createQueryBuilder()
      .update(SalesOrders)
      .set(settingsData)
      .where('id = :salesOrderId', { salesOrderId })
      .execute();
  }

  formatSalesOrders(invoices) {
    return invoices.map(item => ({
      ...item,
      re: parseFloat(item.re),
      tax: parseFloat(item.tax),
      transportPrice: parseFloat(item.transportPrice),
      totalPrice: parseFloat(item.totalPrice),
    }));
  }
}
