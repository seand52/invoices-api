import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Invoices } from '../invoices/invoices.entity';
import { Products } from '../products/products.entity';
import { SalesOrders } from '../sales-orders/sales-orders.entity';

@Entity()
export class InvoiceToProducts {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column('int', { nullable: false })
  public invoiceId!: number;

  @Column('int', { nullable: false })
  public quantity!: number;

  @Column('decimal', { nullable: false, precision: 10, scale: 3, default: 0 })
  public discount: number;

  @Column('decimal', { nullable: false, precision: 10, scale: 2, default: 0 })
  public price: number;

  @Column('varchar', { nullable: false, default: '', length: 55 })
  reference: string;

  @ManyToOne(type => Invoices, invoice => invoice.invoiceToProducts, {
    onDelete: 'CASCADE',
  })
  public invoice!: Invoices;
}
