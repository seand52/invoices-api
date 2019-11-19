import {BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn} from 'typeorm';
import { Users } from '../users/users.entity';
import { IsEmail } from 'class-validator';

@Entity()
export class BusinessInfo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', {nullable: false,  length: 100 })
  name: string;

  @Column('varchar', {nullable: false,  length: 11 })
  cif: string;

  @Column('varchar', {nullable: false,  length: 255 })
  address: string;

  @Column('varchar', {nullable: false,  length: 7 })
  postcode: string;

  @Column('varchar', {nullable: false,  length: 30 })
  city: string;

  @Column('varchar', {nullable: false,  length: 30 })
  country: string;

  @Column('varchar', {nullable: false,  length: 12 })
  telephone: string;

  @Column('varchar', {nullable: false,  length: 55, unique: true })
  @IsEmail()
  email: string;

  @Column('int', { nullable: false })
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(type => Users, user => user.clients, {nullable: false})
    user: Users;

}
