import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseConfig } from 'config/supabase.config';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private readonly configService: ConfigService) {
    const supabaseConfig = this.configService.get<SupabaseConfig>('supabase');

    if (!supabaseConfig?.url) throw new Error('SUPABASE_URL must be defined');
    if (!supabaseConfig?.key) throw new Error('SUPABASE_KEY must be defined');

    this.supabase = createClient(supabaseConfig.url, supabaseConfig.key);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }
}
