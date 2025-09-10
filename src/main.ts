import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './application/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Middleware / pipes globales
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  // Inicialización de la app (no listen)
  await app.init();
  await app.listen(3000);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
