import { User } from '@supabase/supabase-js';

export const fakeApplicationUser: User = {
  id: 'someValidUUID',
  app_metadata: {},
  user_metadata: {},
  aud: '',
  created_at: '',
};
