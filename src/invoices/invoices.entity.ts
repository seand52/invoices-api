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
import { InvoiceToProducts } from '../invoice-products/invoice-products.entity';

export enum PaymentType {
  CASH = 'Efectivo',
  BANK = 'Transferencia',
  CARD = 'Tarjeta',
}

@Entity()
export class Invoices extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { nullable: false, precision: 10, scale: 2, default: 0 })
  totalPrice: string;

  @Column('decimal', { nullable: false, precision: 10, scale: 2, default: 0 })
  re: string;

  @Column('decimal', { nullable: false, precision: 10, scale: 2, default: 0 })
  transportPrice: string;

  @Column('enum', {
    nullable: false,
    enum: PaymentType,
    default: PaymentType.BANK,
  })
  paymentType: string;

  @Column('int', { nullable: false })
  userId: number;

  @Column('int', { nullable: false })
  clientId: number;

  @Column('timestamp', { nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(type => Users, user => user.invoices, { nullable: false })
  user: Users;
  @ManyToOne(type => Clients, client => client.invoices, { nullable: false })
  client: Clients;

  @OneToMany(
    type => InvoiceToProducts,
    invoiceToProducts => invoiceToProducts.invoice,
  )
  public invoiceToProducts!: InvoiceToProducts[];
}
