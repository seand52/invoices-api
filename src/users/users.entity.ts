import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import * as bycript from 'bcrypt';
import { Clients } from '../clients/clients.entity';

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

  @OneToMany(type => Clients, clients => clients.user )
    clients: Clients[];

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bycript.hash(password, this.salt);
    return hash === this.password;
  }
}
