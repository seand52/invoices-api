import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Users } from '../users/users.entity';
import { Clients } from '../clients/clients.entity';
import { SalesOrderToProducts } from '../salesOrder-products/salesOrder-products.entity';

enum PaymentType {
  CASH = 'Efectivo',
  BANK = 'Transferencia',
  CARD = 'Tarjeta',
}

@Entity()
export class SalesOrders extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { nullable: false, precision: 10, scale: 2, default: 0 })
  totalPrice: number;

  @Column('decimal', { nullable: false, precision: 10, scale: 3, default: 0 })
  re: number;

  @Column('decimal', { nullable: false, precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column('decimal', { nullable: false, precision: 10, scale: 2, default: 0 })
  transportPrice: number;

  @Column('enum', {
    nullable: false,
    enum: PaymentType,
    default: PaymentType.BANK,
  })
  paymentType: PaymentType;

  @Column('int', { nullable: false })
  userId: number;

  @Column('int', { nullable: false })
  clientId: number;

  @Column('timestamp', { nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  date: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(type => Users, user => user.salesOrders, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: Users;
  @ManyToOne(type => Clients, client => client.salesOrders, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  client: Clients;

  @OneToMany(
    type => SalesOrderToProducts,
    salesOrderToProducts => salesOrderToProducts.salesOrder,
  )
  public salesOrderToProducts!: SalesOrderToProducts[];
}
