import {BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm';
import { IsEmail } from 'class-validator';
import { Users } from '../users/users.entity';

@Entity()
export class Clients extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {nullable: false, default: '', length: 80 })
  name: string;

  @Column('varchar', {nullable: false, default: '', length: 80})
  shopName: string;

  @Column('varchar', {nullable: false, default: '', length: 255})
  address: string;

  @Column('varchar', {nullable: false, default: '', length: 255})
  city: string;

  @Column('varchar', {nullable: false, default: '', length: 55})
  province: string;

  @Column('varchar', {nullable: false, default: '', length: 7})
  postcode: string;

  @Column('varchar', {nullable: false, default: '', length: 11})
  numNif: string;

  @Column('varchar', {nullable: false, default: '', length: 11})
  numCif: string;

  @Column('varchar', {nullable: false, default: '', length: 12})
  telephone1: string;

  @Column('varchar', {nullable: false, default: '', length: 12})
  telephone2: string;

  @Column('varchar', {nullable: false, default: '', length: 55, unique: true})
  @IsEmail()
  email: string;

  @Column('int', { nullable: false })
  userId: number;

  @ManyToOne(type => Users, user => user.clients, {nullable: false})
    user: Users;

}
