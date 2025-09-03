import { Global, Module } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Global()
@Module({
  providers: [
    {
      provide: 'SUPABASE_CLIENT',
      useFactory: () =>
        createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!),
    },
  ],
  exports: ['SUPABASE_CLIENT'],
})
export class DatabaseModule {}
