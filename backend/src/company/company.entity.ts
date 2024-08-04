import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Store } from '../store/store.entity';

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  companyID: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  email?: string;

  @OneToMany(() => Store, (store) => store.company)
  stores: Store[];
}
