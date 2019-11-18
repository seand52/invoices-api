import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import * as bycript from 'bcrypt';
import { Clients } from '../clients/clients.entity';
import { Products } from '../products/products.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {nullable: false, unique: true})
  username: string;

  @Column('varchar', {nullable: false})
  password: string;

  @Column('varchar', {nullable: false })
  salt: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(type => Clients, clients => clients.user )
  clients: Clients[];

  @OneToMany(type => Products, products => products.user )
  products: Products[];

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bycript.hash(password, this.salt);
    return hash === this.password;
  }
}
