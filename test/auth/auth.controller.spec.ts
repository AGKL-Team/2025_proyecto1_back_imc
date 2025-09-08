import { SignInRequest } from '@/module/auth/application/requests/sign-in-request.interface';
import { AuthService } from '@/module/auth/infrastructure/services/auth.service';
import { AuthController } from '@/module/auth/presentation/api/auth.controller';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { SignInWithPasswordCredentials } from '@supabase/supabase-js';
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

  it('should handle sign in with an unextisting email and return an error', async () => {});

  // ======= SIGN OUT =======
  it('should sign out the currently authenticated user', async () => {});
  it('should handle sign out when no user is authenticated', async () => {});
  it('should handle sign out with expired tokens and return an error', async () => {});

  // ======= SIGN UP =======
  it('should sign up a new user and return user data with a token', async () => {});
  it('should handle sign up with an already registered email and return an error', async () => {});
  it('should handle sign up when the password is too weak and return a validation error', async () => {});
});
