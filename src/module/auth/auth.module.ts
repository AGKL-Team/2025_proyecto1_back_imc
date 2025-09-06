import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SupabaseAuthStrategy } from 'nestjs-supabase-auth';
import { SupabaseStrategy } from './supabase.strategy';

/**
 * Authentication module
 * This module handles user authentication using Supabase.
 */
@Module({
  imports: [PassportModule.register({ defaultStrategy: 'supabase' })],
  providers: [SupabaseAuthStrategy, SupabaseStrategy],
  exports: [SupabaseStrategy],
})
export class AuthModule {}
