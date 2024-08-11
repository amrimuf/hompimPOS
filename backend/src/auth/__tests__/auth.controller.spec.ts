import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { LoginUserDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { HttpException } from '@nestjs/common';
import { User } from '../../user/user.entity';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockAuthService = {
      validateUser: jest.fn(),
      login: jest.fn(),
      register: jest.fn(),
      verifyEmail: jest.fn(),
      refreshToken: jest.fn(),
      revokeRefreshToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const mockUser = {
        userId: '1',
        name: 'John Doe',
        email: 'new@example.com',
        password: 'hashedpassword',
        isVerified: true,
        verificationToken: 'sometoken',
      } as User;
      const mockLoginResult = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      };

      authService.validateUser.mockResolvedValue(mockUser);
      authService.login.mockResolvedValue(mockLoginResult);

      const result = await authController.login(loginUserDto);

      expect(authService.validateUser).toHaveBeenCalledWith(
        loginUserDto.email,
        loginUserDto.password,
      );
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockLoginResult);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      authService.validateUser.mockResolvedValue(null);

      await expect(authController.login(loginUserDto)).rejects.toThrow(
        HttpException,
      );
      await expect(authController.login(loginUserDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should throw ForbiddenException for unverified user', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const mockUser = {
        userId: '1',
        name: 'John Doe',
        email: 'new@example.com',
        password: 'hashedpassword',
        isVerified: false,
        verificationToken: 'sometoken',
      } as User;

      authService.validateUser.mockResolvedValue(mockUser);

      await expect(authController.login(loginUserDto)).rejects.toThrow(
        HttpException,
      );
      await expect(authController.login(loginUserDto)).rejects.toThrow(
        'User is not verified',
      );
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'new@example.com',
        password: 'password',
      };
      const mockUser = {
        userId: '1',
        name: 'John Doe',
        email: 'new@example.com',
        password: 'hashedpassword',
        isVerified: false,
        verificationToken: 'sometoken',
      } as User;

      authService.register.mockResolvedValue(mockUser);

      const result = await authController.register(createUserDto);

      expect(authService.register).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const token = 'verificationToken';

      authService.verifyEmail.mockResolvedValue(undefined);

      const result = await authController.verifyEmail(token);

      expect(authService.verifyEmail).toHaveBeenCalledWith(token);
      expect(result).toEqual({ message: 'Email verified successfully' });
    });

    it('should throw an error if verification fails', async () => {
      const token = 'invalidToken';

      authService.verifyEmail.mockRejectedValue(new Error('Invalid token'));

      await expect(authController.verifyEmail(token)).rejects.toThrow(
        'Invalid token',
      );
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'oldRefreshToken',
      };
      const mockRefreshResult = {
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      };

      authService.refreshToken.mockResolvedValue(mockRefreshResult);

      const result = await authController.refreshToken(refreshTokenDto);

      expect(authService.refreshToken).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
      );
      expect(result).toEqual(mockRefreshResult);
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const refreshToken = 'refreshToken';

      authService.revokeRefreshToken.mockResolvedValue(undefined);

      const result = await authController.logout(refreshToken);

      expect(authService.revokeRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});
