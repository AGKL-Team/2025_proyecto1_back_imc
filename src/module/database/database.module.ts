import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import supabaseConfig from 'config/supabase.config';
import { SupabaseService } from './services/supabase.service';

/**
 * Database module
 */
@Module({
  imports: [ConfigModule.forFeature(supabaseConfig)],
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class DatabaseModule {}
