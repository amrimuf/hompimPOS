import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Role } from '../../auth/role.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
  })
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @Matches(/(?=.*[a-z])/, {
    message: 'Password must contain at least one lowercase letter',
  })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/(?=.*\d)/, { message: 'Password must contain at least one number' })
  @Matches(/(?=.*[@$!%*?&#])/, {
    message: 'Password must contain at least one special character',
  })
  @ApiProperty({
    description: 'The password for the user account',
    example: 'P@ssw0rd!',
  })
  password: string;

  @IsOptional()
  @IsEnum(Role)
  @ApiPropertyOptional({
    description: 'The role of the user, if applicable',
    enum: Role,
    example: Role.STAFF,
  })
  readonly role?: Role;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'The store ID associated with the user, if applicable',
    example: '123',
  })
  storeId?: string;
}
