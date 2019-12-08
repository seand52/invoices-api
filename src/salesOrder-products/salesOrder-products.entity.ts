import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Products } from '../products/products.entity';
import { SalesOrders } from '../sales-orders/sales-orders.entity';

@Entity()
export class SalesOrderToProducts {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column('int', { nullable: false })
  public salesOrderId!: number;

  @Column('int', { nullable: false })
  public productId!: number;

  @Column('int', { nullable: false })
  public quantity!: number;

  @Column('decimal', { nullable: false, precision: 10, scale: 3, default: 0 })
  public discount: number;

  @ManyToOne(
    type => SalesOrders,
    salesOrder => salesOrder.salesOrderToProducts,
    {
      onDelete: 'CASCADE',
    },
  )
  public salesOrder!: SalesOrders;

  @ManyToOne(type => Products, product => product.salesOrderToProducts, {
    onDelete: 'CASCADE',
  })
  public product!: Products;
}
