import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './company.entity';

@ApiTags('companies')
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({
    status: 201,
    description: 'The company has been successfully created.',
    type: Company,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() createCompanyDto: CreateCompanyDto): Promise<Company> {
    return this.companyService.create(createCompanyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all companies.',
    type: [Company],
  })
  async findAll(): Promise<Company[]> {
    return this.companyService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a company by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the company' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the company.',
    type: Company,
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async findOne(@Param('id') id: number): Promise<Company> {
    return this.companyService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a company by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the company' })
  @ApiResponse({
    status: 200,
    description: 'The company has been successfully updated.',
    type: Company,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async update(
    @Param('id') id: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    return this.companyService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a company by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the company' })
  @ApiResponse({
    status: 204,
    description: 'The company has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async remove(@Param('id') id: number): Promise<void> {
    return this.companyService.remove(id);
  }
}
