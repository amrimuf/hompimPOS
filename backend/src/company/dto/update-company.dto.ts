import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyDto } from './create-company.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
  @ApiProperty({
    description: 'The name of the company',
    type: String,
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'The address of the company',
    type: String,
    required: false,
  })
  address?: string;

  @ApiProperty({
    description: 'The phone number of the company',
    type: String,
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: 'The email address of the company',
    type: String,
    required: false,
  })
  email?: string;
}
