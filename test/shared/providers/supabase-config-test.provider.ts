import { SupabaseService } from '@/module/database/services/supabase.service';

export const SupabaseTestProvider = {
  provide: SupabaseService,
  useValue: {
    getClient: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({ data: {}, error: null }),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    }),
  },
};
