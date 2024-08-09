import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { User } from 'src/user/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User | null> {
    return this.userService.validateUser(email, pass);
  }

  async login(user: AuthenticatedUser) {
    const payload = { email: user.email, sub: user.userId, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);

    const verificationToken = uuidv4();
    user.verificationToken = verificationToken;
    await this.userService.save(user);

    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
    );
    return user;
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await this.userService.findByVerificationToken(token);
    if (!user) {
      throw new Error('Invalid or expired verification token');
    }
    user.isVerified = true;
    user.verificationToken = null;
    await this.userService.save(user);
  }
}
