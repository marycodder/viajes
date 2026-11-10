import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities';
import { JwtAuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtModule.registerAsync({ inject: [ConfigService], useFactory: (config: ConfigService) => ({
    secret: config.getOrThrow<string>('JWT_SECRET'), signOptions: { expiresIn: '1h', algorithm: 'HS256', issuer: 'tripplan-api', audience: 'tripplan' },
  }) })],
  controllers: [AuthController], providers: [AuthService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AuthModule {}
