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
import { IsEmail } from 'class-validator';
import { Users } from '../users/users.entity';
import { Invoices } from '../invoices/invoices.entity';
import { SalesOrders } from '../sales-orders/sales-orders.entity';

@Entity()
export class Clients extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { nullable: false, default: '', length: 80 })
  name: string;

  @Column('varchar', { nullable: false, default: '', length: 80 })
  shopName: string;

  @Column('varchar', { nullable: false, default: '', length: 255 })
  address: string;

  @Column('varchar', { nullable: false, default: '', length: 255 })
  city: string;

  @Column('varchar', { nullable: false, default: '', length: 55 })
  province: string;

  @Column('varchar', { nullable: false, default: '', length: 7 })
  postcode: string;

  @Column('varchar', { nullable: false, default: '', length: 12 })
  numNif: string;

  @Column('varchar', { nullable: false, default: '', length: 12 })
  numCif: string;

  @Column('varchar', { nullable: false, default: '', length: 12 })
  telephone1: string;

  @Column('varchar', { nullable: false, default: '', length: 12 })
  telephone2: string;

  @Column('varchar', { nullable: false, default: '', length: 55, unique: true })
  @IsEmail()
  email: string;

  @OneToMany(type => Invoices, invoices => invoices.client)
  invoices: Invoices[];

  @OneToMany(type => SalesOrders, salesOrders => salesOrders.client)
  salesOrders: SalesOrders[];

  @Column('int', { nullable: false })
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(type => Users, user => user.clients, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: Users;
}
