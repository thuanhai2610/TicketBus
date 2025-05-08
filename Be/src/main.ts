import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ExpressAdapter } from '@nestjs/platform-express';

dotenv.config();

async function bootstrap() {
  const expressApp = express(); // Express gốc
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  const PORT = process.env.PORT || 3001;

  app.enableCors({
    origin: process.env.FE,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  expressApp.use(express.urlencoded({ extended: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  expressApp.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  app.useGlobalPipes(new ValidationPipe());

  // Static file cho frontend (Vite build)
  expressApp.use(express.static(join(__dirname, '..', 'dist', 'public')));

  // Fallback route: trả về index.html cho tất cả các route frontend
  expressApp.get('*', (req, res) => {
    res.sendFile(join(__dirname, '..', 'dist', 'public', 'index.html'));
  });

  await app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

bootstrap();
