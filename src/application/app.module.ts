import { Module } from '@nestjs/common';

import { ImcModule } from '../module/imc/imc.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationModule } from '../config/configuration.module';
import { AuthModule } from '../module/auth/auth.module';
import { DatabaseModule } from '../module/database/database.module';

@Module({
  imports: [
    ConfigurationModule,
    // Configuración de TypeOrm
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV === 'dev',
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    // Incluye módulos generales
    DatabaseModule,
    AuthModule,
    // Módulos del dominio
    ImcModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
