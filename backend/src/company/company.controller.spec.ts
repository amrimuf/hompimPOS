import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './company.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('CompanyController', () => {
  let controller: CompanyController;
  let service: CompanyService;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as unknown as CompanyService;

    controller = new CompanyController(service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new company', async () => {
      const createCompanyDto: CreateCompanyDto = {
        name: 'New Company',
        email: 'test@example.com',
        address: '123 Test St',
      };
      const savedCompany: Company = {
        companyID: 1,
        name: 'New Company',
        email: 'test@example.com',
        address: '123 Test St',
        stores: [],
        phone: '',
      };

      jest.spyOn(service, 'create').mockResolvedValue(savedCompany);

      await expect(controller.create(createCompanyDto)).resolves.toEqual(
        savedCompany,
      );
    });

    it('should handle creation failures', async () => {
      const createCompanyDto: CreateCompanyDto = {
        name: 'New Company',
        email: 'test@example.com',
        address: '123 Test St',
      };
      const errorMessage = 'Creation failed';

      jest
        .spyOn(service, 'create')
        .mockRejectedValue(
          new HttpException(errorMessage, HttpStatus.BAD_REQUEST),
        );

      await expect(controller.create(createCompanyDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of companies', async () => {
      const companies: Company[] = [
        {
          companyID: 1,
          name: 'Company One',
          email: 'one@example.com',
          address: '123 First St',
          stores: [],
          phone: '',
        },
        {
          companyID: 2,
          name: 'Company Two',
          email: 'two@example.com',
          address: '456 Second St',
          stores: [],
          phone: '',
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(companies);

      await expect(controller.findAll()).resolves.toEqual(companies);
    });
  });

  describe('findOne', () => {
    it('should return a single company', async () => {
      const company: Company = {
        companyID: 1,
        name: 'Company One',
        email: 'one@example.com',
        address: '123 First St',
        stores: [],
        phone: '',
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(company);

      await expect(controller.findOne(1)).resolves.toEqual(company);
    });

    it('should handle not found exceptions', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(
          new HttpException('Company not found', HttpStatus.NOT_FOUND),
        );

      await expect(controller.findOne(999)).rejects.toThrow(HttpException);
    });
  });

  describe('update', () => {
    it('should update a company', async () => {
      const updateCompanyDto: UpdateCompanyDto = {
        name: 'Updated Company',
      };
      const updatedCompany: Company = {
        companyID: 1,
        name: 'Updated Company',
        email: 'one@example.com',
        address: '123 First St',
        stores: [],
        phone: '',
      };

      jest.spyOn(service, 'update').mockResolvedValue(updatedCompany);

      await expect(controller.update(1, updateCompanyDto)).resolves.toEqual(
        updatedCompany,
      );
    });

    it('should handle update failures', async () => {
      const updateCompanyDto: UpdateCompanyDto = {
        name: 'Updated Company',
      };
      const errorMessage = 'Update failed';

      jest
        .spyOn(service, 'update')
        .mockRejectedValue(
          new HttpException(errorMessage, HttpStatus.BAD_REQUEST),
        );

      await expect(controller.update(1, updateCompanyDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a company', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue();

      await expect(controller.remove(1)).resolves.toBeUndefined();
    });

    it('should handle removal failures', async () => {
      const errorMessage = 'Remove failed';

      jest
        .spyOn(service, 'remove')
        .mockRejectedValue(
          new HttpException(errorMessage, HttpStatus.BAD_REQUEST),
        );

      await expect(controller.remove(1)).rejects.toThrow(HttpException);
    });
  });
});
