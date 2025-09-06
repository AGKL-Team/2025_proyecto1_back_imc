import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from './supabase.service';

describe('SupabaseService', () => {
  let service: SupabaseService;

  beforeEach(async () => {
    // Mocking environment variables for Supabase
    process.env.SUPABASE_URL = 'https://fake-url.supabase.co';
    process.env.SUPABASE_KEY = 'fake-key';

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [SupabaseService],
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
    await expect(
      Test.createTestingModule({
        imports: [ConfigModule],
        providers: [SupabaseService],
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
    process.env.SUPABASE_KEY = '';
    await expect(
      Test.createTestingModule({
        imports: [ConfigModule],
        providers: [SupabaseService],
      })
        .compile()
        .then((module) => {
          module.get<SupabaseService>(SupabaseService);
        }),
    ).rejects.toThrow(
      new Error('SUPABASE_KEY must be defined in configuration'),
    );
  });
});
