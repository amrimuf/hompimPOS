import { Entity, Column, ManyToOne, PrimaryColumn, OneToMany } from 'typeorm';
import { Store } from '../store/store.entity';
import { Role } from '../auth/role.enum';
import { v4 as uuidv4 } from 'uuid';
import { RefreshToken } from '../auth/refresh-token.entity';

@Entity()
export class User {
  @PrimaryColumn('uuid')
  userId: string = uuidv4();

  @ManyToOne(() => Store, (store) => store.users, { nullable: true })
  store?: Store;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  verificationToken: string | null;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.STAFF,
  })
  role: Role;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];
}
