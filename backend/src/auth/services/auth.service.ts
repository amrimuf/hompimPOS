import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/user.service';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { User } from 'src/user/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from './email.service';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from '../refresh-token.entity';
import { Repository } from 'typeorm';
import { UserResponseDto } from '../../user/dto/user-response.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User | null> {
    try {
      return await this.userService.validateUser(email, pass);
    } catch (error) {
      throw new Error('Authentication failed');
    }
  }

  async login(user: User) {
    const payload = { email: user.email, sub: user.userId, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(user);
    return {
      accessToken,
      refreshToken,
    };
  }

  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.create(createUserDto);

    const verificationToken = uuidv4();
    user.verificationToken = verificationToken;
    await this.userService.save(user);

    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
    );

    return plainToClass(UserResponseDto, user);
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

  async refreshToken(oldRefreshToken: string) {
    try {
      const payload = this.jwtService.verify(oldRefreshToken);
      const tokenRecord = await this.refreshTokenRepository.findOne({
        where: { token: oldRefreshToken },
      });

      if (!tokenRecord) {
        throw new UnauthorizedException('Refresh token not found');
      }

      if (tokenRecord.revokedAt) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      if (tokenRecord.expiresAt && tokenRecord.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token has expired');
      }

      const user = await this.userService.findOne(payload.email);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      await this.refreshTokenRepository.update(
        { token: oldRefreshToken },
        { revokedAt: new Date() },
      );

      const newPayload = {
        email: user.email,
        sub: user.userId,
        role: user.role,
      };
      const newAccessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = await this.generateRefreshToken(user);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        throw e;
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async generateRefreshToken(user: User): Promise<string> {
    const refreshToken = this.jwtService.sign(
      { sub: user.userId },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: '7d',
      },
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepository.save({
      userId: user.userId,
      token: refreshToken,
      expiresAt,
    });

    return refreshToken;
  }

  async revokeRefreshToken(token: string) {
    await this.refreshTokenRepository.update(
      { token },
      {
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    );
  }
}
