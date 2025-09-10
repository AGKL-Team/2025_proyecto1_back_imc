import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { AppModule } from '../src/application/app.module';

const server = express();
let cachedServer: express.Express | null = null;

async function bootstrapServer(): Promise<express.Express> {
  if (!cachedServer) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(server),
      { bodyParser: true },
    );

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    cachedServer = server;
  }
  return cachedServer;
}

export default async function (req: VercelRequest, res: VercelResponse) {
  const app = await bootstrapServer();
  return app(req, res); // delega la request al servidor Express de Nest
}
