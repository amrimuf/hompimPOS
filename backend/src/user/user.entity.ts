import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Store } from '../store/store.entity';
import { Role } from '../auth/role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @ManyToOne(() => Store, (store) => store.users, { nullable: true })
  store?: Store;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.STAFF,
  })
  role: Role;
}
