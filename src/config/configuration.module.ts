import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import frontentConfig from './frontent.config';
import supabaseConfig from './supabase.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [frontentConfig, supabaseConfig],
    }),
  ],
})
export class ConfigurationModule {}
