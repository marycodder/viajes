import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TripsModule } from '../trips/trips.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DOCUMENT_MODELS } from './schemas';
@Module({ imports: [TripsModule, MongooseModule.forFeature(DOCUMENT_MODELS)], controllers: [DocumentsController], providers: [DocumentsService] })
export class DocumentsModule {}
