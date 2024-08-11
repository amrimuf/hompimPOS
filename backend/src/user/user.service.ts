import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Store } from '../store/store.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { storeId, name, email, password, role } = createUserDto;

    const existingUser = await this.findOne(email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let store: Store | undefined;

    if (storeId) {
      const foundStore = await this.storeRepository.findOne({
        where: { storeId },
      });
      store = foundStore ?? undefined;
    }

    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      role,
      store,
    });

    return this.userRepository.save(user);
  }

  async save(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { verificationToken: token } });
  }

  // does user exist?
  async findOne(email: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['store'],
    });
    return user ?? undefined;
  }
  async validateUser(email: string, pass: string): Promise<User | null> {
    try {
      const user = await this.findOne(email);
      if (user && (await bcrypt.compare(pass, user.password))) {
        return user;
      }
      return null;
    } catch (error) {
      throw new Error('User validation failed');
    }
  }
}
