import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bycript from 'bcrypt';
import { Clients } from '../clients/clients.entity';
import { Products } from '../products/products.entity';
import { BusinessInfo } from '../business-info/business-info.entity';
import { Invoices } from '../invoices/invoices.entity';
import { SalesOrders } from '../sales-orders/sales-orders.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { nullable: false, unique: true })
  username: string;

  @Column('varchar', { nullable: false })
  password: string;

  @Column('varchar', { nullable: false })
  salt: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(type => Clients, clients => clients.user)
  clients: Clients[];

  @OneToMany(type => Products, products => products.user)
  products: Products[];

  @OneToMany(type => BusinessInfo, businessInfo => businessInfo.user)
  businessInfo: BusinessInfo[];

  @OneToMany(type => Invoices, invoices => invoices.user)
  invoices: Invoices[];

  @OneToMany(type => SalesOrders, salesOrders => salesOrders.user)
  salesOrders: SalesOrders[];

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bycript.hash(password, this.salt);
    return hash === this.password;
  }
}
