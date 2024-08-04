import { Test, TestingModule } from '@nestjs/testing';
import { Repository, UpdateResult } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CompanyService } from './company.service';
import { Company } from './company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';

describe('CompanyService', () => {
  let service: CompanyService;
  let repository: Repository<Company>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        {
          provide: getRepositoryToken(Company),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
    repository = module.get<Repository<Company>>(getRepositoryToken(Company));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new company', async () => {
      const createCompanyDto: CreateCompanyDto = {
        name: 'Test Company',
        address: '123 Test St',
        phone: '123-456-7890',
        email: 'test@example.com',
      };
      const savedCompany = { ...createCompanyDto, companyID: 1 };

      jest.spyOn(repository, 'create').mockReturnValue(savedCompany as any);
      jest.spyOn(repository, 'save').mockResolvedValue(savedCompany as any);

      expect(await service.create(createCompanyDto)).toEqual(savedCompany);
    });
  });

  describe('findAll', () => {
    it('should return an array of companies', async () => {
      const companies = [
        {
          companyID: 1,
          name: 'Test Company',
          address: '123 Test St',
          phone: '123-456-7890',
          email: 'test@example.com',
        },
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(companies as any);

      expect(await service.findAll()).toEqual(companies);
    });
  });

  describe('findOne', () => {
    it('should return a single company by id', async () => {
      const company = {
        companyID: 1,
        name: 'Test Company',
        address: '123 Test St',
        phone: '123-456-7890',
        email: 'test@example.com',
      };
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(company as any);

      expect(await service.findOne(1)).toEqual(company);
    });

    it('should throw an error if company is not found', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(
        'Company with ID 1 not found',
      );
    });
  });

  describe('update', () => {
    it('should update a company and return the updated company', async () => {
      const updateCompanyDto = { name: 'Updated Company' };
      const updateResult: UpdateResult = {
        raw: [],
        affected: 1,
        generatedMaps: [],
      };

      jest.spyOn(repository, 'update').mockResolvedValue(updateResult);
      jest.spyOn(repository, 'findOneBy').mockResolvedValue({
        companyID: 1,
        name: 'Updated Company',
        address: '123 Test St',
        phone: '123-456-7890',
        email: 'test@example.com',
      } as any);

      expect(await service.update(1, updateCompanyDto)).toEqual({
        companyID: 1,
        name: 'Updated Company',
        address: '123 Test St',
        phone: '123-456-7890',
        email: 'test@example.com',
      });
    });
  });

  describe('remove', () => {
    it('should delete a company', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      await expect(service.remove(1)).resolves.not.toThrow();
    });
  });
});
