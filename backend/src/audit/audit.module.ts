import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DOCUMENT_MODELS } from '../documents/schemas';
import { AuditWorker } from './audit.worker';
@Module({ imports: [MongooseModule.forFeature(DOCUMENT_MODELS)], providers: [AuditWorker] })
export class AuditModule {}
