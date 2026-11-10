import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DataSource } from 'typeorm';
import { TripAccessService } from '../src/trips/trip-access.service';
import { WeatherService } from '../src/weather/weather.service';

function service(startDate: string, endDate: string, linked = true) {
  const access = { read: async () => ({ startDate, endDate }) } as unknown as TripAccessService;
  const db = { manager: { existsBy: async () => linked, findOneByOrFail: async () => ({ latitude: -33.4489, longitude: -70.6693 }) } } as unknown as DataSource;
  return new WeatherService(db, access);
}

test('clima fuera del horizonte no llama a Open-Meteo', async () => {
  const result = await service('2099-01-01', '2099-01-10').forecast('trip', 'user', 'destination');
  assert.equal('available' in result && result.available, false);
});

test('clima valida asociación, transforma la respuesta y reutiliza caché', async () => {
  await assert.rejects(service('2026-01-01', '2099-01-01', false).forecast('trip', 'user', 'destination'), /no pertenece/);
  const original = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async input => {
    requests++;
    assert.equal(new URL(String(input)).hostname, 'api.open-meteo.com');
    return new Response(JSON.stringify({ timezone: 'America/Santiago', daily: {
      time: ['2026-11-10'], weather_code: [0], temperature_2m_max: [25], temperature_2m_min: [12], precipitation_probability_max: [5],
    } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  try {
    const weather = service('2026-01-01', '2099-01-01');
    const first = await weather.forecast('trip', 'user', 'destination');
    const second = await weather.forecast('trip', 'user', 'destination');
    assert.deepEqual(first, second); assert.equal(requests, 1);
    assert.ok('daily' in first && first.daily[0].maxTemperature === 25);
  } finally { globalThis.fetch = original; }
});

test('clima convierte fallos y respuestas incompletas del proveedor en 503', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response('{}', { status: 503 });
    await assert.rejects(service('2026-01-01', '2099-01-01').forecast('trip', 'user', 'destination'), /No fue posible obtener el clima/);
    globalThis.fetch = async () => new Response('{}', { status: 200 });
    await assert.rejects(service('2026-01-01', '2099-01-01').forecast('trip', 'user', 'destination'), /No fue posible obtener el clima/);
  } finally { globalThis.fetch = original; }
});
