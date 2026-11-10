import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from './audit/audit.module';
import { AuthModule } from './auth/auth.module';
import { validateEnvironment } from './config/environment';
import { databaseOptions } from './database/data-source';
import { DestinationsModule } from './destinations/destinations.module';
import { DocumentsModule } from './documents/documents.module';
import { HealthController } from './health.controller';
import { PlanningModule } from './planning/planning.module';
import { TripsModule } from './trips/trips.module';
import { WeatherModule } from './weather/weather.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    TypeOrmModule.forRootAsync({ inject: [ConfigService], useFactory: (config: ConfigService) => databaseOptions({
      POSTGRES_HOST: config.getOrThrow('POSTGRES_HOST'), POSTGRES_PORT: String(config.get('POSTGRES_PORT')),
      POSTGRES_USER: config.getOrThrow('POSTGRES_USER'), POSTGRES_PASSWORD: config.getOrThrow('POSTGRES_PASSWORD'), POSTGRES_DB: config.getOrThrow('POSTGRES_DB'),
    }) }),
    MongooseModule.forRootAsync({ inject: [ConfigService], useFactory: (config: ConfigService) => ({
      uri: config.getOrThrow<string>('MONGODB_URI'), bufferCommands: false,
      serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000, retryAttempts: 3,
    }) }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    AuthModule, TripsModule, DestinationsModule, PlanningModule, DocumentsModule, AuditModule, WeatherModule,
  ],
  controllers: [HealthController], providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
