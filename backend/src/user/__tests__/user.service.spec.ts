import { Test, TestingModule } from '@nestjs/testing';
// import { Repository } from 'typeorm';
import { UserService } from '../user.service';
import { User } from '../user.entity';
import { Store } from '../../store/store.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { ConflictException } from '@nestjs/common';
import { Role } from '../../auth/role.enum';

jest.mock('bcryptjs');

describe('UserService', () => {
  let service: UserService;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockStoreRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Store),
          useValue: mockStoreRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    // for spyOn()
    // let userRepository: Repository<User>;
    // let storeRepository: Repository<Store>;
    // userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    // storeRepository = module.get<Repository<Store>>(getRepositoryToken(Store));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException if user already exists', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce({} as User);

      await expect(
        service.create({
          storeId: undefined,
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password',
          role: Role.STAFF,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should successfully create a user', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);
      mockUserRepository.create.mockReturnValue({} as User);
      mockUserRepository.save.mockResolvedValueOnce({} as User);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const user = await service.create({
        storeId: undefined,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
        role: Role.STAFF,
      });

      expect(user).toBeDefined();
    });
  });

  describe('findByVerificationToken', () => {
    it('should return user if found', async () => {
      const user = { email: 'john@example.com' } as User;
      mockUserRepository.findOne.mockResolvedValueOnce(user);

      const result = await service.findByVerificationToken('token');
      expect(result).toEqual(user);
    });

    it('should return null if no user is found', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.findByVerificationToken('token');
      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return user if found', async () => {
      const user = { email: 'john@example.com' } as User;
      mockUserRepository.findOne.mockResolvedValueOnce(user);

      const result = await service.findOne('john@example.com');
      expect(result).toEqual(user);
    });

    it('should return undefined if no user is found', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.findOne('john@example.com');
      expect(result).toBeUndefined();
    });
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const user = { password: 'hashedPassword' } as User;
      mockUserRepository.findOne.mockResolvedValueOnce(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('john@example.com', 'password');
      expect(result).toEqual(user);
    });

    it('should return null if credentials are invalid', async () => {
      const user = { password: 'hashedPassword' } as User;
      mockUserRepository.findOne.mockResolvedValueOnce(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'john@example.com',
        'wrongPassword',
      );
      expect(result).toBeNull();
    });

    it('should throw an error if findOne fails', async () => {
      mockUserRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(
        service.validateUser('test@example.com', 'password'),
      ).rejects.toThrow('User validation failed');
    });
  });
});
