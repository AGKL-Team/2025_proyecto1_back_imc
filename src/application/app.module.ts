import { Module } from '@nestjs/common';

import { ImcModule } from '../module/imc/imc.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationModule } from '../config/configuration.module';

@Module({
  imports: [
    ConfigurationModule,
    // Configuración de TypeOrm
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false }, // obligatorio en Supabase
      autoLoadEntities: true,
      synchronize: true,
    }),
    // Incluye módulos generales
    // DatabaseModule,
    // AuthModule,
    // Módulos del dominio
    ImcModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
