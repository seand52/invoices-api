import { Repository, EntityRepository, getConnection } from 'typeorm';
import { Clients } from './clients.entity';

@EntityRepository(Clients)
export class ClientsRepository extends Repository<Clients> {
  findClientInvoices(clientId) {
    return (
      this.createQueryBuilder('invoice')
        // .select(['invoice', 'client.name', 'client.email', 'client.telephone1'])
        .where('invoice.clientId = :clientId', { clientId })
        .getMany()
    );
  }

  searchClientsByName(name) {
    return this.createQueryBuilder('client')
      .where('client.name like :name', {
        name: '%' + name + '%',
      })
      .getMany();
  }
}
