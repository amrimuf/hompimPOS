import { Test, TestingModule } from '@nestjs/testing';
import { Repository, UpdateResult } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CompanyService } from './company.service';
import { Company } from './company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Logger, NotFoundException } from '@nestjs/common';

describe('CompanyService', () => {
  let service: CompanyService;
  let repository: Repository<Company>;
  let logger: Logger;

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
        Logger,
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
    repository = module.get<Repository<Company>>(getRepositoryToken(Company));
    logger = module.get<Logger>(Logger);

    jest.spyOn(logger, 'log').mockImplementation(() => {});
    jest.spyOn(logger, 'error').mockImplementation(() => {});
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new company and log the process', async () => {
      const createCompanyDto: CreateCompanyDto = {
        name: 'Test Company',
        address: '123 Test St',
        phone: '123-456-7890',
        email: 'test@example.com',
      };
      const savedCompany = { ...createCompanyDto, companyID: 1 };

      jest.spyOn(repository, 'create').mockReturnValue(savedCompany as any);
      jest.spyOn(repository, 'save').mockResolvedValue(savedCompany as any);

      await expect(service.create(createCompanyDto)).resolves.toEqual(
        savedCompany,
      );
      expect(logger.log).toHaveBeenCalledWith(
        'Creating a new company',
        JSON.stringify(createCompanyDto),
      );
      expect(logger.log).toHaveBeenCalledWith(
        `Successfully created company with ID ${savedCompany.companyID}`,
      );
    });

    it('should log an error if company creation fails', async () => {
      const createCompanyDto: CreateCompanyDto = {
        name: 'Test Company',
        address: '123 Test St',
        phone: '123-456-7890',
        email: 'test@example.com',
      };
      const error = new Error('Failed to create company');

      jest.spyOn(repository, 'save').mockRejectedValue(error);

      await expect(service.create(createCompanyDto)).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to create company',
        error.stack,
      );
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

    it('should throw an error if fetching companies fails', async () => {
      const error = new Error('Failed to fetch companies');
      jest.spyOn(repository, 'find').mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow(error);
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

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if fetching a company fails', async () => {
      const error = new Error('Failed to fetch company');
      jest.spyOn(repository, 'findOneBy').mockRejectedValue(error);

      await expect(service.findOne(1)).rejects.toThrow(error);
    });
  });

  describe('update', () => {
    it('should update a company and return the updated company', async () => {
      const updateCompanyDto: UpdateCompanyDto = { name: 'Updated Company' };
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

    it('should throw an error if company update fails', async () => {
      const updateCompanyDto: UpdateCompanyDto = { name: 'Updated Company' };
      const error = new Error('Failed to update company');

      jest.spyOn(repository, 'update').mockRejectedValue(error);

      await expect(service.update(1, updateCompanyDto)).rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    it('should delete a company', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      await expect(service.remove(1)).resolves.not.toThrow();
    });

    it('should throw an error if company is not found for deletion', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0 } as any);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw an error if company deletion fails', async () => {
      const error = new Error('Failed to delete company');
      jest.spyOn(repository, 'delete').mockRejectedValue(error);

      await expect(service.remove(1)).rejects.toThrow(error);
    });
  });

  describe('removeBulk', () => {
    it('should delete multiple companies', async () => {
      const ids = [1, 2, 3];
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: ids.length } as any);

      await expect(service.removeBulk(ids)).resolves.not.toThrow();
    });

    it('should handle empty id list gracefully', async () => {
      const ids: number[] = [];
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0 } as any);

      await expect(service.removeBulk(ids)).resolves.not.toThrow();
    });

    it('should throw an error if deletion fails', async () => {
      const ids = [1, 2, 3];
      const error = new Error('Failed to delete companies');

      jest.spyOn(repository, 'delete').mockRejectedValue(error);

      await expect(service.removeBulk(ids)).rejects.toThrow(error);
    });
  });
});
