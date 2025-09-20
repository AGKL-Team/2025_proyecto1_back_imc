import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthError } from '@supabase/supabase-js';
import { SupabaseService } from '../../src/module/database/services/supabase.service';
import { ConfigTestProvider } from '../shared/providers/config-test.provider';
import { SupabaseTestProvider } from '../shared/providers/supabase-config-test.provider';

describe('SupabaseService', () => {
  let service: SupabaseService;

  beforeEach(async () => {
    // Mocking environment variables for Supabase
    process.env.SUPABASE_URL = 'https://fake-url.supabase.co';
    process.env.SUPABASE_KEY = 'fake-key';

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [SupabaseService, SupabaseTestProvider, ConfigTestProvider],
    }).compile();

    service = module.get<SupabaseService>(SupabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize Supabase client', () => {
    expect(service.getClient()).not.toBeNull();
  });

  it('should throw error if SUPABASE_URL is missing', async () => {
    process.env.SUPABASE_URL = '';
    process.env.SUPABASE_KEY = 'fake-key';
    await expect(
      Test.createTestingModule({
        imports: [ConfigModule],
        providers: [SupabaseService, ConfigTestProvider],
      })
        .compile()
        .then((module) => {
          module.get<SupabaseService>(SupabaseService);
        }),
    ).rejects.toThrow(
      new Error('SUPABASE_URL must be defined in configuration'),
    );
  });

  it('should throw error if SUPABASE_KEY is missing', async () => {
    process.env.SUPABASE_URL = 'https://fake-url.supabase.co';
    process.env.SUPABASE_KEY = '';
    await expect(
      Test.createTestingModule({
        imports: [ConfigModule],
        providers: [SupabaseService, ConfigTestProvider],
      })
        .compile()
        .then((module) => {
          module.get<SupabaseService>(SupabaseService);
        }),
    ).rejects.toThrow(
      new Error('SUPABASE_KEY must be defined in configuration'),
    );
  });

  it('should throw BadRequestException with "El usuario ya existe" for user_already_exists', () => {
    expect(() =>
      service.handleError({
        code: 'user_already_exists',
        message: '',
      } as any),
    ).toThrow('El usuario ya existe');
  });

  it('should throw BadRequestException with "El correo electrónico no es válido" for invalid_email', () => {
    expect(() =>
      service.handleError({ code: 'invalid_email', message: '' } as any),
    ).toThrow('El correo electrónico no es válido');
  });

  it('should throw BadRequestException with "La contraseña no es válida" for invalid_password', () => {
    expect(() => {
      const error = {
        code: 'invalid_password',
        status: 400,
        name: '',
        message: '',
        __isAuthError: false,
      } as any as AuthError;

      service.handleError(error);
    }).toThrow('La contraseña no es válida');
  });

  it('should throw BadRequestException with "Las credenciales son inválidas" for invalid_credentials', () => {
    expect(() =>
      service.handleError({
        code: 'invalid_credentials',
        message: '',
      } as any),
    ).toThrow('Las credenciales son inválidas');
  });

  it('should throw BadRequestException with default message for unknown error code', () => {
    expect(() =>
      service.handleError({ code: 'unknown_code', message: '' } as any),
    ).toThrow(
      'Ocurrió un error inesperado. Inténtalo de nuevo más tarde.unknown_code',
    );
  });
});
