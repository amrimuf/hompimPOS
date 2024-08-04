import { Test, TestingModule } from '@nestjs/testing';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { Company } from './company.entity';

describe('CompanyController', () => {
  let controller: CompanyController;
  let service: CompanyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [
        {
          provide: CompanyService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CompanyController>(CompanyController);
    service = module.get<CompanyService>(CompanyService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new company', async () => {
      const createCompanyDto = {
        name: 'Test Company',
        address: '123 Test St',
        phone: '123-456-7890',
        email: 'test@example.com',
      };
      const savedCompany: Company = {
        companyID: 1,
        name: 'Test Company',
        address: '123 Test St',
        phone: '123-456-7890',
        email: 'test@example.com',
        stores: [],
      };

      jest.spyOn(service, 'create').mockResolvedValue(savedCompany);

      expect(await controller.create(createCompanyDto)).toEqual(savedCompany);
    });
  });

  describe('findAll', () => {
    it('should return an array of companies', async () => {
      const companies: Company[] = [
        {
          companyID: 1,
          name: 'Test Company',
          address: '123 Test St',
          phone: '123-456-7890',
          email: 'test@example.com',
          stores: [],
        },
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(companies);

      expect(await controller.findAll()).toEqual(companies);
    });
  });

  describe('findOne', () => {
    it('should return a company by id', async () => {
      const company: Company = {
        companyID: 1,
        name: 'Test Company',
        address: '123 Test St',
        phone: '123-456-7890',
        email: 'test@example.com',
        stores: [],
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(company);

      expect(await controller.findOne(1)).toEqual(company);
    });

    it('should throw an error if company is not found', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new Error('Company with ID 1 not found'));

      await expect(controller.findOne(1)).rejects.toThrow(
        'Company with ID 1 not found',
      );
    });
  });

  describe('update', () => {
    it('should update a company and return the updated company', async () => {
      const updateCompanyDto = { name: 'Updated Company' };
      const updatedCompany: Company = {
        companyID: 1,
        name: 'Updated Company',
        address: '123 Test St',
        phone: '123-456-7890',
        email: 'test@example.com',
        stores: [],
      };

      jest.spyOn(service, 'update').mockResolvedValue(updatedCompany);

      expect(await controller.update(1, updateCompanyDto)).toEqual(
        updatedCompany,
      );
    });
  });

  describe('remove', () => {
    it('should delete a company', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await expect(controller.remove(1)).resolves.not.toThrow();
    });
  });
});
