import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Store } from '../store/store.entity';

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: 'Unique identifier for the company',
    example: 1,
  })
  companyID: number;

  @Column()
  @ApiProperty({
    description: 'Name of the company',
    example: 'Tech Corp',
  })
  name: string;

  @Column()
  @ApiProperty({
    description: 'Address of the company',
    example: '123 Tech Street',
  })
  address: string;

  @Column({ nullable: true })
  @ApiProperty({
    description: 'Phone number of the company',
    example: '123-456-7890',
    required: false,
  })
  phone?: string;

  @Column({ nullable: true })
  @ApiProperty({
    description: 'Email address of the company',
    example: 'contact@techcorp.com',
    required: false,
  })
  email?: string;

  @OneToMany(() => Store, (store) => store.company)
  @ApiProperty({
    description: 'List of stores associated with the company',
    type: [Store],
    required: false,
  })
  stores: Store[];
}
