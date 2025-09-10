import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configSchema } from './config.schema';
import frontentConfig from './frontent.config';
import supabaseConfig from './supabase.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      envFilePath: '.env',
      load: [frontentConfig, supabaseConfig],
      validationSchema: configSchema,
    }),
  ],
})
export class ConfigurationModule {}
