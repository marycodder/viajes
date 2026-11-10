import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApp } from './setup-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  const config = app.get(ConfigService);
  setupApp(app, String(config.get('CORS_ORIGINS', 'http://localhost:5173,http://localhost:8080')).split(',').map(origin => origin.trim()).filter(Boolean));
  app.enableShutdownHooks();
  await app.listen(config.get<number>('PORT', 3000), '0.0.0.0');
  Logger.log('TripPlan API disponible en /api/v1. Swagger: /docs', 'Bootstrap');
}
void bootstrap().catch(() => { Logger.error('No se pudo iniciar la API. Revisa la configuración y los servicios de bases de datos.', 'Bootstrap'); process.exitCode = 1; });
