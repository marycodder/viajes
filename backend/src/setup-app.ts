import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/http-exception.filter';

export function setupApp(app: INestApplication, origins: string[] = []) {
  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.enableCors({ origin: origins, methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] });
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true, forbidUnknownValues: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  const config = new DocumentBuilder().setTitle('TripPlan API').setVersion('1.0.0')
    .setDescription('Hito 3: PostgreSQL para operaciones, MongoDB para documentos e historial. Inicia sesión y usa Authorize con accessToken. Listas: limit=50 (máximo 100), offset=0. Errores: {statusCode,message,path,timestamp}. 400 validación, 401 sesión, 403 permisos, 404 inexistente, 409 conflicto, 429 límite, 503 servicio externo. El propietario modifica; viajeros consultan y administran favoritos personales. Importes enteros CLP.')
    .addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, { swaggerOptions: { persistAuthorization: false } });
  return document;
}
