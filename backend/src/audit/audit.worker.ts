import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DataSource, IsNull } from 'typeorm';
import { AuditOutbox } from '../database/entities';
import { TripEvent, TripNote, TripRecommendation } from '../documents/schemas';

@Injectable()
export class AuditWorker implements OnModuleInit, OnModuleDestroy {
  private timer?: NodeJS.Timeout;
  private running = false;
  private readonly logger = new Logger(AuditWorker.name);
  constructor(private readonly db: DataSource,
    @InjectModel(TripEvent.name) private readonly events: Model<TripEvent>,
    @InjectModel(TripNote.name) private readonly notes: Model<TripNote>,
    @InjectModel(TripRecommendation.name) private readonly recommendations: Model<TripRecommendation>) {}

  onModuleInit() { this.timer = setInterval(() => { void this.flush(); }, 1500); this.timer.unref(); }
  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }

  async flush() {
    if (this.running) return;
    this.running = true;
    try {
      const pending = await this.db.getRepository(AuditOutbox).find({ where: { deliveredAt: IsNull() }, order: { createdAt: 'ASC' }, take: 50 });
      for (const event of pending) {
        if (event.action === 'trip.deleted') {
          await this.notes.deleteMany({ tripId: event.tripId }).exec();
          await this.recommendations.deleteMany({ tripId: event.tripId }).exec();
        }
        // eventId único evita duplicar si se reinicia la API entre escribir Mongo y marcar SQL.
        await this.events.updateOne({ eventId: event.id }, { $setOnInsert: {
          eventId: event.id, tripId: event.tripId, actorId: event.actorId,
          action: event.action, metadata: event.metadata, occurredAt: event.createdAt,
        } }, { upsert: true }).exec();
        await this.db.getRepository(AuditOutbox).update({ id: event.id }, { deliveredAt: new Date() });
      }
    } catch {
      this.logger.warn('Entrega de historial pendiente; se reintentará sin perder los eventos SQL.');
    } finally { this.running = false; }
  }
}
