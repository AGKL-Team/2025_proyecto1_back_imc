import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import frontentConfig from './frontent.config';
import supabaseConfig from './supabase.config';
import { configSchema } from './config.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [frontentConfig, supabaseConfig],
      validationSchema: configSchema,
    }),
  ],
})
export class ConfigurationModule {}
