import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  private readonly logger = new Logger(CompanyService.name);

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    this.logger.log('Creating a new company');
    try {
      const company = this.companyRepository.create(createCompanyDto);
      return await this.companyRepository.save(company);
    } catch (error) {
      this.logger.error('Failed to create company', error.stack);
      throw error;
    }
  }

  async findAll(): Promise<Company[]> {
    return this.companyRepository.find();
  }

  async findOne(id: number): Promise<Company> {
    const company = await this.companyRepository.findOneBy({ companyID: id });
    if (!company) {
      throw new Error(`Company with ID ${id} not found`);
    }
    return company;
  }

  async update(
    id: number,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    await this.companyRepository.update(id, updateCompanyDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.companyRepository.delete(id);
  }
}
