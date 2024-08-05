import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    this.logger.log('Creating a new company', JSON.stringify(createCompanyDto));
    try {
      const company = this.companyRepository.create(createCompanyDto);
      const savedCompany = await this.companyRepository.save(company);
      this.logger.log(
        `Successfully created company with ID ${savedCompany.companyID}`,
      );
      return savedCompany;
    } catch (error) {
      this.logger.error('Failed to create company', error.stack);
      throw error;
    }
  }

  async findAll(): Promise<Company[]> {
    this.logger.log('Fetching all companies');
    try {
      const companies = await this.companyRepository.find();
      this.logger.log(`Found ${companies.length} companies`);
      return companies;
    } catch (error) {
      this.logger.error('Failed to fetch companies', error.stack);
      throw error;
    }
  }

  async findOne(id: number): Promise<Company> {
    this.logger.log(`Fetching company with ID ${id}`);
    try {
      const company = await this.companyRepository.findOneBy({ companyID: id });
      if (!company) {
        this.logger.warn(`Company with ID ${id} not found`);
        throw new NotFoundException(`Company with ID ${id} not found`);
      }
      return company;
    } catch (error) {
      this.logger.error(`Failed to fetch company with ID ${id}`, error.stack);
      throw error;
    }
  }

  async update(
    id: number,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    this.logger.log(
      `Updating company with ID ${id}`,
      JSON.stringify(updateCompanyDto),
    );
    try {
      await this.companyRepository.update(id, updateCompanyDto);
      const updatedCompany = await this.findOne(id);
      this.logger.log(`Successfully updated company with ID ${id}`);
      return updatedCompany;
    } catch (error) {
      this.logger.error(`Failed to update company with ID ${id}`, error.stack);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Deleting company with ID ${id}`);
    try {
      const result = await this.companyRepository.delete(id);
      if (result.affected === 0) {
        this.logger.warn(`Company with ID ${id} not found for deletion`);
        throw new NotFoundException(`Company with ID ${id} not found`);
      }
      this.logger.log(`Successfully deleted company with ID ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete company with ID ${id}`, error.stack);
      throw error;
    }
  }

  async removeBulk(ids: number[]): Promise<void> {
    this.logger.log(
      `Attempting to delete companies with IDs: ${ids.join(', ')}`,
    );

    if (ids.length === 0) {
      this.logger.warn('No IDs provided for bulk deletion');
      return;
    }

    try {
      const result = await this.companyRepository.delete(ids);

      if (result.affected !== ids.length) {
        this.logger.warn(
          `Some companies with IDs ${ids.join(', ')} were not found for deletion`,
        );
      } else {
        this.logger.log(
          `Successfully deleted companies with IDs: ${ids.join(', ')}`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to delete companies', error.stack);
      throw error;
    }
  }
}
