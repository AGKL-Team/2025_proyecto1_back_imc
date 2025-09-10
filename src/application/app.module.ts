import { Module } from '@nestjs/common';

import { ImcModule } from '../module/imc/imc.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationModule } from 'config/configuration.module';

@Module({
  imports: [
    ConfigurationModule,
    // Configuración de TypeOrm
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
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
