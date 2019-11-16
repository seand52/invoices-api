import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import * as bycript from 'bcrypt';

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

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bycript.hash(password, this.salt);
    return hash === this.password;
  }
}
