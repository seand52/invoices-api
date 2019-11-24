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
import { InvoiceToProducts } from '../invoice-products/invoice-products.entity';
import { SalesOrderToProducts } from '../salesOrder-products/salesOrder-products.entity';

@Entity()
export class Products extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { nullable: false, length: 255 })
  description: string;

  @Column('decimal', { nullable: false, precision: 10, scale: 2 })
  price: number;

  @Column('int', { nullable: false })
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(type => Users, user => user.products, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: Users;

  @OneToMany(
    type => InvoiceToProducts,
    invoiceToProducts => invoiceToProducts.product,
  )
  public invoiceToProducts!: InvoiceToProducts[];

  @OneToMany(
    type => SalesOrderToProducts,
    salesOrderToProducts => salesOrderToProducts.product,
  )
  public salesOrderToProducts!: SalesOrderToProducts[];
}
