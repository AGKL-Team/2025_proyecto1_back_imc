import { AuthController } from '@/module/auth/api/auth.controller';
import { AuthService } from '@/module/auth/services/auth.service';
import { Test } from '@nestjs/testing';
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
  it('should sign in a user with valid credentials and return user data with a token', async () => {});
  it('should sign in a user with invalid credentials and return an error', async () => {});
  it('should handle sign in when the authentication service is down', async () => {});
  it('should handle sign in with missing fields and return a validation error', async () => {});
  it('should handle sign in with an unextisting email and return an error', async () => {});

  // ======= SIGN OUT =======
  it('should sign out the currently authenticated user', async () => {});
  it('should handle sign out when no user is authenticated', async () => {});
  it('should handle sign out when the authentication service is down', async () => {});
  it('should handle sign out with expired tokens and return an error', async () => {});

  // ======= SIGN UP =======
  it('should sign up a new user and return user data with a token', async () => {});
  it('should handle sign up with an already registered email and return an error', async () => {});
  it('should handle sign up when the password is too weak and return a validation error', async () => {});
});
