import { ConfigService } from '@nestjs/config';

export const ConfigTestProvider = {
  provide: ConfigService,
  useValue: {
    get: jest.fn((key: string) => {
      if (key === 'frontend') return { url: process.env.FRONTEND_URL };
      if (key === 'supabase')
        return { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_KEY };
      return undefined;
    }),
  },
};
