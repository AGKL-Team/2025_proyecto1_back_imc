import { SignInRequest } from '@/module/auth/application/requests/sign-in-request';
import { SignUpRequest } from '@/module/auth/application/requests/sign-up-request';
import { AuthService } from '@/module/auth/infrastructure/services/auth.service';
import { SupabaseService } from '@/module/database/services/supabase.service';
import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

describe('AuthService', () => {
  let service: AuthService;
  let supabaseService: jest.Mocked<SupabaseService>;
  let supabaseClient: any;

  beforeEach(async () => {
    supabaseClient = {
      rpc: jest.fn(),
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        signOut: jest.fn(),
      },
    };

    supabaseService = {
      getClient: jest.fn().mockReturnValue(supabaseClient),
    } as any;

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: SupabaseService, useValue: supabaseService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // valor por defecto para FRONTEND_URL
    process.env.FRONTEND_URL = 'http://localhost:3000';
  });

  // ======= SIGN UP =======
  it('should sign up a new user successfully', async () => {
    supabaseClient.rpc.mockResolvedValue(null); // usuario no existe
    supabaseClient.auth.signUp.mockResolvedValue({ data: {}, error: null });

    const request: SignUpRequest = {
      email: 'test@test.com',
      password: '123456',
    };
    await service.signUp(request);

    expect(supabaseClient.rpc).toHaveBeenCalled();
    expect(supabaseClient.auth.signUp).toHaveBeenCalledWith({
      ...request,
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/email-confirmed',
      },
    });
  });

  it('should throw if user already exists', async () => {
    supabaseClient.rpc.mockResolvedValue(true); // existe

    await expect(
      service.signUp({ email: 'exists@test.com', password: '123456' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw if FRONTEND_URL is not defined', async () => {
    delete process.env.FRONTEND_URL;
    supabaseClient.rpc.mockResolvedValue(null);

    await expect(
      service.signUp({ email: 'test@test.com', password: '123456' }),
    ).rejects.toThrow('FRONTEND_URL is not defined');
  });

  it('should throw if signUp fails', async () => {
    supabaseClient.rpc.mockResolvedValue(null);
    supabaseClient.auth.signUp.mockResolvedValue({ error: 'fail' });

    await expect(
      service.signUp({ email: 'test@test.com', password: '123456' }),
    ).rejects.toThrow(BadRequestException);
  });

  // ======= SIGN IN =======
  it('should sign in a user successfully', async () => {
    supabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { session: { access_token: 'token', expires_in: 3600 } },
      error: null,
    });

    const request: SignInRequest = {
      email: 'test@test.com',
      password: '123456',
    };
    const result = await service.signIn(request);

    expect(result).toEqual({ access_token: 'token', expires_in: 3600 });
    expect(supabaseClient.auth.signInWithPassword).toHaveBeenCalledWith(
      request,
    );
  });

  it('should throw if signIn fails', async () => {
    supabaseClient.auth.signInWithPassword.mockResolvedValue({ error: 'fail' });

    await expect(
      service.signIn({ email: 'test@test.com', password: 'wrong' }),
    ).rejects.toThrow(BadRequestException);
  });

  // ======= SIGN OUT =======
  it('should sign out successfully', async () => {
    supabaseClient.auth.signOut.mockResolvedValue({ error: null });

    const result = await service.signOut();

    expect(result).toEqual({ error: null });
    expect(supabaseClient.auth.signOut).toHaveBeenCalledWith({
      scope: 'global',
    });
  });

  it('should throw if signOut fails', async () => {
    supabaseClient.auth.signOut.mockResolvedValue({ error: 'fail' });

    await expect(service.signOut()).rejects.toThrow(BadRequestException);
  });
});
