import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { Handler } from 'express';
import { AppModule } from './application/app.module';

const server = express();
let cachedApp: any;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
      {
        logger: ['log', 'error', 'warn', 'debug', 'verbose'],
      },
    );

    // Middleware / pipes globales
    app.enableCors({
      origin: process.env.FRONTEND_URL || '*',
    });
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );

    // Inicialización de la app (no listen)
    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}

// Vercel handler
export default server as Handler;

// Inicializamos la app en cold-start
bootstrap();
