import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { EmailService } from './email.service';
import { RefreshToken } from './refresh-token.entity';
import { User } from '../user/user.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let emailService: EmailService;

  const mockUserService = {
    validateUser: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findByVerificationToken: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockEmailService = {
    sendVerificationEmail: jest.fn(),
  };

  const mockRefreshTokenRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EmailService, useValue: mockEmailService },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: mockRefreshTokenRepository,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    module.get<UserService>(UserService);
    module.get<JwtService>(JwtService);
    emailService = module.get<EmailService>(EmailService);
    module.get<Repository<RefreshToken>>(getRepositoryToken(RefreshToken));
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should validate a user', async () => {
      const mockUser = { email: 'test@example.com', userId: '1' };
      mockUserService.validateUser.mockResolvedValue(mockUser);

      const result = await authService.validateUser(
        'test@example.com',
        'password',
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should login a user and return tokens', async () => {
      const mockUser = { email: 'test@example.com', userId: '1', role: 'user' };
      mockJwtService.sign.mockReturnValueOnce('mockAccessToken');
      mockJwtService.sign.mockReturnValueOnce('mockRefreshToken');
      mockRefreshTokenRepository.save.mockResolvedValue({});

      const result = await authService.login(mockUser as User);
      expect(result).toEqual({
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
      });
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'new@example.com',
        password: 'password',
      };
      const mockUser = {
        ...createUserDto,
        userId: '1',
        verificationToken: 'token',
      };
      mockUserService.create.mockResolvedValue(mockUser);
      mockUserService.save.mockResolvedValue(mockUser);

      const result = await authService.register(createUserDto);
      expect(result).toEqual(mockUser);
      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.verificationToken,
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify a user email', async () => {
      const mockUser = {
        email: 'test@example.com',
        isVerified: false,
        verificationToken: 'token',
      };
      mockUserService.findByVerificationToken.mockResolvedValue(mockUser);
      mockUserService.save.mockResolvedValue({
        ...mockUser,
        isVerified: true,
        verificationToken: null,
      });

      await authService.verifyEmail('token');
      expect(mockUser.isVerified).toBe(true);
      expect(mockUser.verificationToken).toBeNull();
    });

    it('should throw an error for invalid token', async () => {
      mockUserService.findByVerificationToken.mockResolvedValue(null);

      await expect(authService.verifyEmail('invalid-token')).rejects.toThrow(
        'Invalid or expired verification token',
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens', async () => {
      const oldRefreshToken = 'oldRefreshToken';
      const mockPayload = { email: 'test@example.com', sub: '1', role: 'user' };
      const mockUser = { email: 'test@example.com', userId: '1', role: 'user' };

      mockJwtService.verify.mockReturnValue(mockPayload);
      mockRefreshTokenRepository.findOne.mockResolvedValue({
        token: oldRefreshToken,
        expiresAt: new Date(Date.now() + 1000000),
      });
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValueOnce('newAccessToken');
      mockJwtService.sign.mockReturnValueOnce('newRefreshToken');

      const result = await authService.refreshToken(oldRefreshToken);
      expect(result).toEqual({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      });
    });

    it('should throw UnauthorizedException for revoked token', async () => {
      mockJwtService.verify.mockReturnValue({});
      mockRefreshTokenRepository.findOne.mockResolvedValue({
        revokedAt: new Date(),
      });

      await expect(authService.refreshToken('revokedToken')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('revokeRefreshToken', () => {
    it('should revoke a refresh token', async () => {
      const token = 'tokenToRevoke';
      await authService.revokeRefreshToken(token);
      expect(mockRefreshTokenRepository.update).toHaveBeenCalledWith(
        { token },
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
    });
  });
});
