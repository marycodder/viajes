import 'reflect-metadata';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { DataType, newDb } from 'pg-mem';
import { DataSource } from 'typeorm';
import { AuthModule } from '../src/auth/auth.module';
import { ENTITIES, AuditOutbox } from '../src/database/entities';
import { InitialSchema1794180000000 } from '../src/database/migrations/1794180000000-InitialSchema';
import { DestinationsModule } from '../src/destinations/destinations.module';
import { PlanningModule } from '../src/planning/planning.module';
import { setupApp } from '../src/setup-app';
import { TripsModule } from '../src/trips/trips.module';

// pg-mem devuelve date como medianoche UTC; el driver real de pg usa fechas locales.
// Fijamos la zona solo para este proceso de prueba para evitar el desfase del emulador.
process.env.TZ = 'UTC';

test('API HTTP con autenticación, migración SQL y reglas de negocio (pg-mem)', async t => {
  const memory = newDb({ autoCreateForeignKeyIndices: true });
  memory.public.registerFunction({ name: 'current_database', returns: DataType.text, implementation: () => 'tripplan_test' });
  memory.public.registerFunction({ name: 'version', returns: DataType.text, implementation: () => 'PostgreSQL 17.0' });
  memory.registerExtension('pgcrypto', schema => schema.registerFunction({ name: 'gen_random_uuid', returns: DataType.uuid, impure: true, implementation: randomUUID }));
  const db: DataSource = memory.adapters.createTypeormDataSource({ type: 'postgres', entities: ENTITIES, migrations: [InitialSchema1794180000000], migrationsRun: true, synchronize: false });
  await db.initialize();
  @Global() @Module({ providers: [{ provide: DataSource, useValue: db }], exports: [DataSource] })
  class TestSqlModule {}
  const module = await Test.createTestingModule({ imports: [
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, load: [() => ({ JWT_SECRET: 'test-only-secret-for-tripplan-over-32-characters' })] }),
    TestSqlModule, AuthModule, TripsModule, DestinationsModule, PlanningModule,
  ] }).compile();
  const app = module.createNestApplication({ logger: false });
  const contract = setupApp(app, ['http://localhost:5173']);
  await app.listen(0, '127.0.0.1');
  const base = `${await app.getUrl()}/api/v1`;
  let token = '';
  async function request(path: string, method = 'GET', body?: unknown, expected = 200, auth = token) {
    const response = await fetch(`${base}${path}`, { method, signal: AbortSignal.timeout(10000), headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: `Bearer ${auth}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
    const data = await response.json() as any;
    assert.equal(response.status, expected, `${method} ${path}: ${JSON.stringify(data)}`);
    return data;
  }
  try {
    let owner: any, traveler: any, outsider: any, trip: any, destination: any, day: any, activity: any, expense: any, reservation: any;
    await t.test('Swagger incluye recursos, DTO y seguridad Bearer', () => {
      assert.ok(contract.paths['/api/v1/trips/{tripId}/expenses']);
      assert.ok(contract.components?.schemas?.CreateActivityDto);
      assert.ok(contract.components?.securitySchemes?.bearer);
    });
    await t.test('rechaza acceso sin token y contraseñas débiles', async () => {
      await request('/trips', 'GET', undefined, 401, '');
      await request('/auth/register', 'POST', { name: 'Demo', email: 'weak@example.com', password: '123' }, 400, '');
    });
    await t.test('registro, normalización de correo, login y perfil sin hash', async () => {
      owner = await request('/auth/register', 'POST', { name: 'Propietario', email: ' OWNER@example.com ', password: 'ViajesDemo2026' }, 201, '');
      token = owner.accessToken;
      assert.equal(owner.user.email, 'owner@example.com');
      const profile = await request('/users/me');
      assert.equal(profile.passwordHash, undefined);
      await request('/auth/register', 'POST', { name: 'Duplicado', email: 'owner@example.com', password: 'ViajesDemo2026' }, 409, '');
      await request('/auth/login', 'POST', { email: 'owner@example.com', password: 'incorrecta' }, 401, '');
      const login = await request('/auth/login', 'POST', { email: 'owner@example.com', password: 'ViajesDemo2026' }, 200, '');
      assert.ok(login.accessToken);
      traveler = await request('/auth/register', 'POST', { name: 'Viajero', email: 'traveler@example.com', password: 'ViajesDemo2026' }, 201, '');
      outsider = await request('/auth/register', 'POST', { name: 'Ajeno', email: 'outsider@example.com', password: 'ViajesDemo2026' }, 201, '');
    });
    await t.test('valida fechas, nulos, campos desconocidos y límites', async () => {
      await request('/trips', 'POST', { name: 'Inválido', startDate: '2026-02-30', endDate: '2026-03-05' }, 400);
      await request('/trips', 'POST', { name: 'Inválido', startDate: '2026-12-15', endDate: '2026-12-10' }, 400);
      await request('/trips', 'POST', { name: 'Inválido', startDate: '2026-12-10', endDate: '2026-12-15', ownerId: outsider.user.id }, 400);
      await request('/trips?limit=101', 'GET', undefined, 400);
      await request('/trips/not-a-uuid', 'GET', undefined, 400);
      trip = await request('/trips', 'POST', { name: 'Viaje de prueba', startDate: '2026-12-10', endDate: '2026-12-15', budget: 10000 }, 201);
      await request(`/trips/${trip.id}`, 'PATCH', { name: null }, 400);
      assert.equal((await request(`/trips/${trip.id}`)).name, 'Viaje de prueba');
      assert.equal((await request(`/trips/${trip.id}`)).startDate, '2026-12-10');
    });
    await t.test('agrega viajeros; impide accesos ajenos y modificaciones de invitados', async () => {
      await request(`/trips/${trip.id}`, 'GET', undefined, 403, outsider.accessToken);
      assert.equal((await request('/trips', 'GET', undefined, 200, outsider.accessToken)).length, 0);
      await request(`/trips/${trip.id}/travelers`, 'POST', { email: 'traveler@example.com' }, 201);
      assert.equal((await request('/trips', 'GET', undefined, 200, traveler.accessToken)).length, 1);
      await request(`/trips/${trip.id}`, 'PATCH', { budget: 0 }, 403, traveler.accessToken);
      await request(`/trips/${trip.id}/travelers/${owner.user.id}`, 'DELETE', undefined, 400);
    });
    await t.test('catálogo, asociación de destinos y día único dentro del viaje', async () => {
      destination = await request('/destinations', 'POST', { name: 'Santiago', country: 'Chile', latitude: -33.4489, longitude: -70.6693 }, 201);
      await request(`/trips/${trip.id}/days`, 'POST', { destinationId: destination.id, date: '2026-12-11' }, 400);
      await request(`/trips/${trip.id}/destinations`, 'POST', { destinationId: destination.id }, 201);
      await request(`/trips/${trip.id}/days`, 'POST', { destinationId: destination.id, date: '2026-12-09' }, 400);
      day = await request(`/trips/${trip.id}/days`, 'POST', { destinationId: destination.id, date: '2026-12-11', title: 'Turismo' }, 201);
      await request(`/trips/${trip.id}/days`, 'POST', { destinationId: destination.id, date: '2026-12-11' }, 409);
      await request(`/trips/${trip.id}/destinations/${destination.id}`, 'DELETE', undefined, 409);
    });
    await t.test('actividades, filtros y favoritos personales idempotentes', async () => {
      activity = await request(`/trips/${trip.id}/activities`, 'POST', { dayId: day.id, name: 'Cerro', category: 'Turismo', time: '09:00', estimatedCost: 5000 }, 201);
      await request(`/trips/${trip.id}/activities`, 'POST', { dayId: day.id, name: 'Inválida', category: 'Turismo', time: '25:00' }, 400);
      await request(`/trips/${trip.id}/activities/${activity.id}/favorite`, 'PUT', undefined, 200, traveler.accessToken);
      await request(`/trips/${trip.id}/activities/${activity.id}/favorite`, 'PUT', undefined, 200, traveler.accessToken);
      const favorites = await request(`/trips/${trip.id}/favorites`, 'GET', undefined, 200, traveler.accessToken);
      assert.equal(favorites.length, 1); assert.equal(favorites[0].favorite, true);
      assert.equal((await request(`/trips/${trip.id}/favorites`)).length, 0);
      assert.equal((await request(`/trips/${trip.id}/activities?search=Cerro`)).length, 1);
      assert.equal((await request(`/trips/${trip.id}/activities?category=Cultura`)).length, 0);
    });
    await t.test('gastos reales y resumen independientes del costo estimado', async () => {
      await request(`/trips/${trip.id}/expenses`, 'POST', { description: 'Error', category: 'Turismo', date: '2026-11-01', amount: 0 }, 400);
      expense = await request(`/trips/${trip.id}/expenses`, 'POST', { description: 'Compra anticipada', category: 'Turismo', date: '2026-11-01', amount: 12000, activityId: activity.id, paidBy: traveler.user.id }, 201);
      const summary = await request(`/trips/${trip.id}/summary`);
      assert.equal(summary.estimatedActivitiesCost, 5000); assert.equal(summary.spent, 12000);
      assert.equal(summary.remaining, -2000); assert.equal(summary.overBudget, true);
      assert.equal(summary.budgetUsedPercent, 120);
    });
    await t.test('impide vincular actividades de otro viaje', async () => {
      const other = await request('/trips', 'POST', { name: 'Otro', startDate: '2026-12-10', endDate: '2026-12-15' }, 201);
      await request(`/trips/${other.id}/expenses`, 'POST', { description: 'Ajeno', category: 'Error', date: '2026-12-11', amount: 10, activityId: activity.id }, 404);
      await request(`/trips/${other.id}`, 'DELETE');
    });
    await t.test('reservas simuladas, cancelación y protección de dependencias', async () => {
      reservation = await request(`/trips/${trip.id}/reservations`, 'POST', { type: 'activity', provider: 'Prueba', startDate: '2026-12-11', endDate: '2026-12-11', activityId: activity.id, status: 'confirmed' }, 201);
      await request(`/trips/${trip.id}/activities/${activity.id}`, 'DELETE', undefined, 409);
      await request(`/trips/${trip.id}`, 'PATCH', { startDate: '2026-12-12' }, 400);
      await request(`/trips/${trip.id}/reservations/${reservation.id}`, 'PATCH', { status: 'cancelled' });
      await request(`/trips/${trip.id}/reservations/${reservation.id}`, 'PATCH', { status: 'confirmed' }, 400);
    });
    await t.test('la transacción registra el historial pendiente en SQL', async () => {
      const outbox = await db.getRepository(AuditOutbox).findBy({ tripId: trip.id });
      assert.ok(outbox.some(event => event.action === 'expense.created'));
      assert.ok(outbox.every(event => event.deliveredAt === null));
    });
    await t.test('desvincula referencias, elimina registros y revoca acceso de viajeros', async () => {
      await request(`/trips/${trip.id}/expenses/${expense.id}`, 'PATCH', { activityId: null });
      await request(`/trips/${trip.id}/reservations/${reservation.id}`, 'DELETE');
      await request(`/trips/${trip.id}/activities/${activity.id}`, 'DELETE');
      await request(`/trips/${trip.id}/days/${day.id}`, 'DELETE');
      await request(`/trips/${trip.id}/travelers/${traveler.user.id}`, 'DELETE');
      await request(`/trips/${trip.id}`, 'GET', undefined, 403, traveler.accessToken);
      await request(`/trips/${trip.id}`, 'DELETE');
      await request(`/trips/${trip.id}`, 'GET', undefined, 404);
      await request(`/destinations/${destination.id}`, 'DELETE');
    });
  } finally { await app.close(); if (db.isInitialized) await db.destroy(); }
});
