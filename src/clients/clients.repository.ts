import {Repository, EntityRepository, getConnection} from 'typeorm';
import { Clients } from './clients.entity';

@EntityRepository(Clients)
export class ClientsRepository extends Repository<Clients> {

  async getClientsForPage() {
    
  }
}
