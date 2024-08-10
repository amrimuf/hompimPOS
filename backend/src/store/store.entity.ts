import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Company } from '../company/company.entity';
import { User } from '../user/user.entity';

@Entity()
export class Store {
  @PrimaryGeneratedColumn()
  storeId: string;

  @Column()
  name: string;

  @Column()
  location: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  email?: string;

  @ManyToOne(() => Company, (company) => company.stores)
  company: Company;

  @OneToMany(() => User, (user) => user.store)
  users: User[];
}
