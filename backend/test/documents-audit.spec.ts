import 'reflect-metadata';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { ForbiddenException } from '@nestjs/common';
import { model, Model } from 'mongoose';
import { DataSource } from 'typeorm';
import { AuditWorker } from '../src/audit/audit.worker';
import { PageQuery } from '../src/common/validation';
import { DocumentsService } from '../src/documents/documents.service';
import { TripEvent, TripNote, TripNoteSchema, TripRecommendation, TripRecommendationSchema } from '../src/documents/schemas';
import { TripAccessService } from '../src/trips/trip-access.service';

test('modelos Mongo validan contenido, etiquetas y campos requeridos sin conexión', async () => {
  const Notes = model('SchemaTestNote', TripNoteSchema);
  const Recommendations = model('SchemaTestRecommendation', TripRecommendationSchema);
  const valid = new Notes({ tripId: randomUUID(), authorId: randomUUID(), title: 'Equipaje', content: 'Llevar agua', tags: ['viaje'] });
  await valid.validate();
  await assert.rejects(new Notes({ title: 'Sin contenido' }).validate());
  await assert.rejects(new Recommendations({ tripId: randomUUID(), authorId: randomUUID(), title: 'X'.repeat(151), content: 'Texto' }).validate());
});

test('notas comprueban permisos antes de consultar MongoDB', async () => {
  let touchedMongo = false;
  const access = { read: async () => { throw new ForbiddenException(); } } as unknown as TripAccessService;
  const notes = { find: () => { touchedMongo = true; } } as unknown as Model<TripNote>;
  const service = new DocumentsService(access, notes, {} as Model<TripRecommendation>, {} as Model<TripEvent>);
  await assert.rejects(service.listNotes(randomUUID(), randomUUID(), new PageQuery()), ForbiddenException);
  assert.equal(touchedMongo, false);
});

test('editar nota filtra por viaje e identificador y evita modificar documentos ajenos', async () => {
  const tripId = randomUUID();
  const userId = randomUUID();
  let filter: unknown;
  const access = { owner: async () => ({ id: tripId }) } as unknown as TripAccessService;
  const notes = { findOneAndUpdate: (where: unknown) => { filter = where; return { lean: () => ({ exec: async () => null }) }; } } as unknown as Model<TripNote>;
  const service = new DocumentsService(access, notes, {} as Model<TripRecommendation>, {} as Model<TripEvent>);
  await assert.rejects(service.updateNote(tripId, userId, '0123456789abcdef01234567', { title: 'Ajena' }), /Nota no encontrada/);
  assert.deepEqual(filter, { _id: '0123456789abcdef01234567', tripId });
});

test('outbox reintenta fallos de Mongo y entrega eventos sin duplicar', async () => {
  const pending = { id: randomUUID(), tripId: randomUUID(), actorId: randomUUID(), action: 'expense.created', metadata: {}, createdAt: new Date(), deliveredAt: null as Date | null };
  let mongoUnavailable = true;
  let sqlUpdateFails = false;
  const delivered = new Map<string, object>();
  const repo = { find: async () => pending.deliveredAt ? [] : [pending], update: async () => {
    if (sqlUpdateFails) { sqlUpdateFails = false; throw new Error('SQL connection lost'); }
    pending.deliveredAt = new Date();
  } };
  const db = { getRepository: () => repo } as unknown as DataSource;
  const events = { updateOne: (filter: { eventId: string }, update: { $setOnInsert: object }) => ({ exec: async () => {
    if (mongoUnavailable) throw new Error('Mongo temporarily down');
    if (!delivered.has(filter.eventId)) delivered.set(filter.eventId, update.$setOnInsert);
  } }) } as unknown as Model<TripEvent>;
  const worker = new AuditWorker(db, events, {} as Model<TripNote>, {} as Model<TripRecommendation>);
  await worker.flush(); assert.equal(pending.deliveredAt, null); assert.equal(delivered.size, 0);
  mongoUnavailable = false; sqlUpdateFails = true;
  await worker.flush(); assert.equal(pending.deliveredAt, null); assert.equal(delivered.size, 1);
  await worker.flush(); assert.ok(pending.deliveredAt); assert.equal(delivered.size, 1);
});
