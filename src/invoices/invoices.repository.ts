import {Repository, EntityRepository, getConnection} from 'typeorm';
import { Invoices } from './invoices.entity';

@EntityRepository(Invoices)
export class InvoicesRepository extends Repository<Invoices> {
   retrieveInvoiceInfo(id) {
    return this.createQueryBuilder('invoice')
    .leftJoin('invoice.client', 'client')
    .leftJoin('invoice.invoiceToProducts', 'itp')
    .leftJoin('itp.product', 'product')
    .select(['invoice', 'itp', 'client.name', 'product', 'client.email', 'client.telephone1'])
    .where('invoice.id = :id', {id})
    .getMany();
  }

  findClientInvoices(clientId) {
    return this.createQueryBuilder('invoice')
    .where('invoice.clientId = :clientId', {clientId})
    .getMany();
  }

}
