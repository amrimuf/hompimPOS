import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  userId: string;

  @Exclude()
  password: string;
}
