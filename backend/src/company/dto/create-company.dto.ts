import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'The name of the company',
    example: 'Acme Corp',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The address of the company',
    example: '123 Main St',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({
    description: 'The phone number of the company',
    example: '123-456-7890',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'The email address of the company',
    example: 'contact@acme.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}
