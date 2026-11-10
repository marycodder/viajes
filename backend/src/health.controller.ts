import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Connection } from 'mongoose';
import { DataSource } from 'typeorm';
import { Public } from './auth/auth.guard';

@ApiTags('Estado de servicios') @Controller('health')
export class HealthController {
  constructor(private readonly sql: DataSource, @InjectConnection() private readonly mongo: Connection) {}
  @Public() @SkipThrottle() @Get() @ApiOperation({ summary: 'Verificar PostgreSQL y MongoDB; responde 503 si falla alguno' })
  async health() {
    try {
      if (!this.mongo.db) throw new Error('Mongo not connected');
      await Promise.all([this.sql.query('SELECT 1'), this.mongo.db.admin().ping()]);
      return { status: 'ok', services: { postgres: 'up', mongodb: 'up' } };
    } catch { throw new ServiceUnavailableException('Uno o más servicios de persistencia no están disponibles.'); }
  }
}
