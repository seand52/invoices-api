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

@Entity()
export class Products extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { nullable: false, length: 100 })
  reference: string;

  @Column('varchar', { nullable: false, length: 100 })
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
}
