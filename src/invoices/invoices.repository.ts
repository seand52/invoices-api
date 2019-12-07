import { Repository, EntityRepository, getConnection } from 'typeorm';
import { Invoices } from './invoices.entity';

@EntityRepository(Invoices)
export class InvoicesRepository extends Repository<Invoices> {
  async retrieveInvoiceInfo(id) {
    const invoices = await this.createQueryBuilder('invoice')
      .leftJoin('invoice.client', 'client')
      .leftJoin('invoice.invoiceToProducts', 'itp')
      .leftJoin('itp.product', 'product')
      .select([
        'invoice',
        'itp',
        'client.name',
        'product',
        'client.email',
        'client.telephone1',
      ])
      .where('invoice.id = :id', { id })
      .getMany();
    return this.formatInvoices(invoices);
  }

  async findClientInvoices(clientId) {
    const invoices = await this.createQueryBuilder('invoice')
      .where('invoice.clientId = :clientId', { clientId })
      .getMany();
    return this.formatInvoices(invoices);
  }

  createInvoice(settingsData) {
    return this.createQueryBuilder()
      .insert()
      .into(Invoices)
      .values(settingsData)
      .execute();
  }

  updateInvoice(settingsData, invoiceId) {
    const { tax, ...updateData } = settingsData;
    return this.createQueryBuilder()
      .update(Invoices)
      .set(updateData)
      .where('id = :invoiceId', { invoiceId })
      .execute();
  }

  formatInvoices(invoices) {
    return invoices.map(item => ({
      ...item,
      re: parseFloat(item.re),
      tax: parseFloat(item.tax),
      transportPrice: parseFloat(item.transportPrice),
      totalPrice: parseFloat(item.totalPrice),
    }));
  }
}
