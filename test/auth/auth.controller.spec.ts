import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { SignInWithPasswordCredentials } from '@supabase/supabase-js';
import { SignInRequest } from '../../src/module/auth/application/requests/sign-in-request';
import { SignUpRequest } from '../../src/module/auth/application/requests/sign-up-request';
import { AuthService } from '../../src/module/auth/infrastructure/services/auth.service';
import { AuthController } from '../../src/module/auth/presentation/api/auth.controller';
import { ConfigTestProvider } from '../shared/providers/config-test.provider';
import { SupabaseTestProvider } from '../shared/providers/supabase-config-test.provider';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signIn: jest.fn(),
            signUp: jest.fn(),
            signOut: jest.fn(),
          },
        },
        SupabaseTestProvider,
        ConfigTestProvider,
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  // ======= SIGN IN =======
  it('should sign in a user with valid credentials and return user data with a token', async () => {
    const request: SignInWithPasswordCredentials = {
      email: 'test@gmail.com',
      password: 'MyStrongPassword123',
    };

    jest.spyOn(service, 'signIn').mockResolvedValue({
      access_token: '',
      expires_in: 3600,
    });

    const result = await controller.signIn(request);

    expect(result).toEqual({
      access_token: '',
      expires_in: 3600,
    });
    expect(service.signIn).toHaveBeenCalledWith(request);
  });

  it('should sign in a user with invalid credentials and return an error', async () => {
    const request: SignInWithPasswordCredentials = {
      email: 'test@gmail.com',
      password: 'WrongPassword',
    };

    jest
      .spyOn(service, 'signIn')
      .mockRejectedValue(new Error('Invalid credentials'));

    await expect(controller.signIn(request)).rejects.toThrow(
      'Invalid credentials',
    );
    expect(service.signIn).toHaveBeenCalledWith(request);
  });

  it('should handle sign in with missing fields and return a validation error', async () => {
    const invalidRequest: SignInWithPasswordCredentials = {
      email: 'WrongEmail',
      password: 'SomePassword',
    };

    const validationPipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    await expect(
      validationPipe.transform(invalidRequest, {
        type: 'body',
        metatype: SignInRequest,
      }),
    ).rejects.toThrow(BadRequestException);

    expect(service.signIn).not.toHaveBeenCalled();
  });

  it('should handle sign in with an unextisting email and return an error', async () => {
    // Arrange
    const request: SignInWithPasswordCredentials = {
      email: 'test@gmail.com',
      password: 'MyStrongPassword123',
    };

    jest
      .spyOn(service, 'signIn')
      .mockRejectedValue(new Error('User not found'));

    // Act
    const result = controller.signIn(request);

    // Assert
    await expect(result).rejects.toThrow('User not found');
    expect(service.signIn).toHaveBeenCalledWith(request);
  });

  // ======= SIGN OUT =======
  it('should sign out the currently authenticated user', async () => {
    // Arrange
    jest.spyOn(service, 'signOut').mockResolvedValue({} as any);

    // Act
    const result = await controller.signOut();

    // Assert
    expect(result).toEqual({} as any);
    expect(service.signOut).toHaveBeenCalled();
  });

  it('should handle sign out when no user is authenticated', async () => {
    // Arrange
    jest
      .spyOn(service, 'signOut')
      .mockRejectedValue(new Error('No user authenticated'));

    // Act
    const result = controller.signOut();

    // Assert
    await expect(result).rejects.toThrow('No user authenticated');
    expect(service.signOut).toHaveBeenCalled();
  });

  it('should handle sign out with expired tokens and return an error', async () => {
    // Arrange
    jest
      .spyOn(service, 'signOut')
      .mockRejectedValue(new Error('Token expired'));

    // Act
    const result = controller.signOut();

    // Assert
    await expect(result).rejects.toThrow('Token expired');
    expect(service.signOut).toHaveBeenCalled();
  });

  // ======= SIGN UP =======
  it('should sign up a new user and return user data with a token', async () => {
    // Arrange
    const request = {
      email: 'test@gmail.com',
      password: 'MyStrongPassword123',
    };

    jest.spyOn(service, 'signUp').mockResolvedValue({} as any);

    // Act
    const result = await controller.signUp(request);

    // Assert
    expect(result).toEqual({} as any);
    expect(service.signUp).toHaveBeenCalledWith(request);
  });

  it('should handle sign up with an already registered email and return an error', async () => {
    // Arrange
    const request: SignUpRequest = {
      email: 'test@gmail.com',
      password: 'MyStrongPassword123',
    };

    jest
      .spyOn(service, 'signUp')
      .mockRejectedValue(new Error('User already exists'));

    // Act
    const result = controller.signUp(request);

    // Assert
    await expect(result).rejects.toThrow('User already exists');
    expect(service.signUp).toHaveBeenCalledWith(request);
  });

  it('should handle sign up when the password is too weak and return a validation error', async () => {
    // Arrange
    const request: SignUpRequest = {
      email: 'test@gmail.com',
      password: 'weak',
    };

    const validationPipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    // Act
    const result = validationPipe.transform(request, {
      type: 'body',
      metatype: SignUpRequest,
    });

    // Assert
    await expect(result).rejects.toThrow(BadRequestException);
    expect(service.signUp).not.toHaveBeenCalled();
  });
});
