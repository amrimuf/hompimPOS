import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Company } from '../company/company.entity';

@Entity()
export class Store {
  @PrimaryGeneratedColumn()
  storeID: number;

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
}
