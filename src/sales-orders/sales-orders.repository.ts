import { Repository, EntityRepository, getConnection } from 'typeorm';
import { SalesOrders } from './sales-orders.entity';

@EntityRepository(SalesOrders)
export class SalesOrdersRepository extends Repository<SalesOrders> {}
